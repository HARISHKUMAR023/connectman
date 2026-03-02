import { ipcMain } from 'electron'
import * as storage from './storage'

ipcMain.handle("save-server",
 async(event,server)=>{

 storage.saveServer(server)

 return true

})


ipcMain.handle("load-servers",
 async()=>{

 return storage.loadServers()

})