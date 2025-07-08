import { AppStore } from '@/main/common/store/app_store';

export function get<T>(key: string, defaultValue?: T) {
  return AppStore.getInstance().get(key, defaultValue);
}

export function set<T>(key: string, newValue?: T) {
  let mergeValue = newValue;
  const oldValue = get(key);
  if (typeof oldValue === 'object') {
    // @ts-ignore
    mergeValue = { ...oldValue, ...newValue };
  }
  return AppStore.getInstance().set(key, mergeValue);
}
