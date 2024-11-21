const handle: ProxyHandler<ApiLike> = {
  get(target: ApiLike, name: string) {
    const value = target[name]
    if (value) {
      return value
    }
    const parent = target.parent ? `${target.parent}-${name}` : name
    async function executor() {}
    executor.parent = parent
    target[name] = new Proxy(executor, handle)
    return target[name]
  },
  apply(target: ApiLike, _thisArg, argumentsList: any[]) {
    if (target.parent) {
      // @ts-ignore
      return window.electron.ipcRenderer.invoke(target.parent, ...argumentsList)
    }
  }
}

type ApiLike = Record<string, any> & { parent?: string }
// @ts-ignore
window.api = new Proxy(async function () {}, handle)
