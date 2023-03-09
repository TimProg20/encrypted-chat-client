const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createKeyTable: (request) => ipcRenderer.invoke('key:create-table', request),
  createKey: (request) => ipcRenderer.invoke('key:create', request),
  selectKeys: () => ipcRenderer.invoke('key:select'),
  updateKeys: (request) => ipcRenderer.invoke('key:update', request),
  removeKeys: (request) => ipcRenderer.invoke('key:remove', request),
  dropTableKeys: () => ipcRenderer.invoke('key:drop-table'),
});