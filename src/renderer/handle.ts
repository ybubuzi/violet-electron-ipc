const handle: ProxyHandler<ApiLike> = {
  get(target: ApiLike, name: string) {
    const value = target[name];
    if (value) {
      return value;
    }
    const parent = target.parent ? `${target.parent}-${name}` : name;
    async function executor() {}
    executor.parent = parent;
    target[name] = new Proxy(executor, handle);
    return target[name];
  },
  apply(target: ApiLike, _thisArg, argumentsList: any[]) {
    if (target.parent) {
      // @ts-ignore
      return Promise.resolve(window.electron.ipcRenderer.invoke(target.parent, ...argumentsList)).then((result) => {
        if (result.status === 'error') {
          throw result.error;
        }
        return result.data;
      });
    }
  }
};
const api = new Proxy(async function () {}, handle);

/**
 * 弱引用式事件通知方法
 * vue组件内使用addListener添加通知回调方法
 * 组件销毁时自动移除监听，无需手动移除 (<ゝω·)☆
 *
 * 注：
 * 由于垃圾回收（GC）的运行机制，自动回收过程可能会经历几秒到数十秒的延迟。
 * 因此，在频繁操作的场景中，建议优先考虑手动移除对象。
 */
class Notify {
  private listenerMapper: Map<string, Array<WeakRef<Function>>> = new Map();
  private ipcEventCounter: Map<string, number> = new Map();
  addListener(event: string, callback: Function) {
    let callbackArray = this.listenerMapper.get(event);
    if (!callbackArray) {
      callbackArray = new Array();
      this.listenerMapper.set(event, callbackArray);
      // @ts-ignore 首次建立监听时，需要建立通知
      api.notify.link(event);
      this.linkListener(event);
    }
    callbackArray.push(new WeakRef(callback));
    this.updateListeners(event, callbackArray);
  }

  removeListener(event: string, callback: Function) {
    let callbackArray = this.listenerMapper.get(event);
    if (callbackArray) {
      callbackArray = callbackArray.filter((item) => {
        return item.deref() !== callback;
      });
    }
    this.updateListeners(event, callbackArray);
  }

  removeAllListeners(event: string) {
    this.listenerMapper.delete(event);
    this.updateListeners(event);
  }

  private updateListeners(event: string, listeners?: Array<WeakRef<Function>>) {
    if (!listeners || listeners.length === 0) {
      this.unlinkListener(event);
      this.listenerMapper.delete(event);
    } else {
      this.listenerMapper.set(event, listeners);
    }
  }

  private linkListener(event: string) {
    const count = this.ipcEventCounter.get(event) || 0;
    if (count > 0) {
      this.ipcEventCounter.set(event, count + 1);
      return;
    }
    this.ipcEventCounter.set(event, 1);
    // @ts-ignore
    window.electron.ipcRenderer.on(event, (_invoke: import('electron').IpcRendererEvent, ...args: any[]) => {
      let callbackArray = this.listenerMapper.get(event);
      if (!callbackArray) {
        return;
      }
      let hasUpdate = 0;
      for (const callback of callbackArray) {
        const target = callback.deref();
        if (target === undefined) {
          hasUpdate++;
          continue;
        }
        try {
          target(...args);
        } catch (error) {
          console.error(error);
        }
      }
      if (hasUpdate) {
        callbackArray = callbackArray.filter((item) => item.deref() != undefined);
        this.updateListeners(event, callbackArray);
      }
    });
  }
  private unlinkListener(event: string) {
    // @ts-ignore 回调为空时删除链接
    api.notify.unlink(event);
  }
}

type ApiLike = Record<string, any> & { parent?: string };
// @ts-ignore
window.api = api;
// @ts-ignore
window.notify = new Notify();
