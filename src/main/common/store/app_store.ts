import { Conf, ConfOptions } from 'electron-conf';
import { getUserDataPath } from '@/main/utils/paths';
import path from 'path';
type RemovalCallback = () => void;

interface AppStoreConfig {
  serialportPort: string;
  serialportBaudRate: number;
  serialportDataBits: number;
  serialportStopBits: number;
  [key: string]: unknown;
}

function getConfOption() {
  const AppConfOption = {
    name: 'conf',
    dir: path.join(getUserDataPath(), 'conf')
  } satisfies ConfOptions<unknown>;
  return AppConfOption;
}

export class AppStore {
  private static _instance: AppStore;
  private store!: InstanceType<typeof Conf<AppStoreConfig>>;

  public static getInstance(): AppStore {
    if (!AppStore._instance) {
      const appStore = {
        store: new Conf(getConfOption())
      };
      Object.setPrototypeOf(appStore, AppStore.prototype);
      AppStore._instance = appStore as unknown as AppStore;
    }
    return AppStore._instance;
  }

  private constructor() {
    throw new Error('AppStore is a singleton and should not be instantiated directly. Use AppStore.getInstance() instead.');
  }

  public onDidChange<T = unknown>(key: string, callback: (newValue: T, oldValue: T) => void) {
    const removalCallback = this.store.onDidChange(key, callback);
    // 存储实际上返回一个函数，可以调用该函数来删除侦听器
    return removalCallback as any as RemovalCallback;
  }
  public set<T = any>(key: string, value: T): void {
    this.store.set(key, value);
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    return this.store.get(key, defaultValue) as T;
  }
  public delete(key: string) {
    this.store.delete(key);
  }

  public has(key: string): boolean {
    return this.store.has(key);
  }
}
