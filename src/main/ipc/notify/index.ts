import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { addTargetNotify } from '@/main/notify'
export function notify(evetn: string, invoke: IpcMainInvokeEvent) {
    return "hello world"
}