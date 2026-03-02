import { contextBridge, ipcRenderer } from 'electron'

console.log("✅ Preload Loaded")

contextBridge.exposeInMainWorld('api', {

  saveServer: (server:any) =>
    ipcRenderer.invoke('save-server', server),

  loadServers: () =>
    ipcRenderer.invoke('load-servers')

})