import { BrowserWindow, webContents,WebContents } from 'electron'
import { ipcMain, IpcMainEvent, IpcMainInvokeEvent } from 'electron'
const notify_target_mapper = new Map<string, Set<WebContents>>()

/**
 * 
 * @param event 
 * @param invokeEvent 
 */
export function addTargetNotify(event: string, invokeEvent: IpcMainInvokeEvent) {
    if(!invokeEvent.sender || !(invokeEvent.sender instanceof webContents)){
        throw new Error('addTargetNotify')
    }
    let contentSet = notify_target_mapper.get(event)
    if(!contentSet){
        contentSet = new Set()
        notify_target_mapper.set(event,contentSet)
    }
    contentSet.add(invokeEvent.sender)
}

export function notify(...args){
    
}