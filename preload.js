const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    init: () => ipcRenderer.send('init'),
    getMainpage: () => ipcRenderer.invoke('load-mainpage'),
    setWallpaper: (id) => ipcRenderer.send('set-wallpaper',id),
    getcwd: () => ipcRenderer.invoke('get-cwd'),
    windowEvents: (type) => ipcRenderer.send('window-events',type)
});
