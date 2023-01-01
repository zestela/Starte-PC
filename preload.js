const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    init: () => ipcRenderer.send('init'), // init mainpage
    setWallpaper: (id) => ipcRenderer.send('set-wallpaper', id), // set wallpaper
    getcwd: () => ipcRenderer.invoke('get-cwd'), // get electron's cwd
    getSetting: (name) => ipcRenderer.invoke('get-setting', name),
    getappdata: () => ipcRenderer.invoke('get-appdata'), // get electron's cwd
    getId: () => ipcRenderer.invoke('get-shareId'),
    getShareType: () => ipcRenderer.invoke('get-shareType'),
    windowEvents: (type) => ipcRenderer.send('window-events', type), // windows events
    share: (id, type) => ipcRenderer.send('share', id, type),
    saveShare: (data) => ipcRenderer.send('save-share', data),
    goToPage: (pageId) => ipcRenderer.send("go-to-page", pageId),
    getVersion: () => ipcRenderer.invoke('get-version'),
    outAlert: (str) => ipcRenderer.send('out-alert', str),
    setSetting: (name, value) => ipcRenderer.send('set-setting', name, value)
});
