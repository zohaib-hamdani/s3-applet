window.addEventListener('DOMContentLoaded', () => {
    const { contextBridge, ipcRenderer } = require('electron');

    contextBridge.exposeInMainWorld('electron', {
        ipcRenderer: ipcRenderer
    });
});