const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    init: () => ipcRenderer.send('init'), // init mainpage
    getMainpage: () => ipcRenderer.invoke('load-mainpage'), // get mainpage info
    setWallpaper: (id) => ipcRenderer.send('set-wallpaper', id), // set wallpaper
    getcwd: () => ipcRenderer.invoke('get-cwd'), // get electron's cwd
    getappdata: () => ipcRenderer.invoke('get-appdata'), // get electron's cwd
    getId: () => ipcRenderer.invoke('get-shareId'),
    windowEvents: (type) => ipcRenderer.send('window-events', type), // windows events
    share: (id) => ipcRenderer.send('share', id),
    saveShare: (data) => ipcRenderer.send('save-share', data),
    goToPage: (pageId) => ipcRenderer.send("go-to-page", pageId),
    getVersion: () => ipcRenderer.invoke('get-version'),
    outAlert: (str) => ipcRenderer.send('out-alert', str)
});
