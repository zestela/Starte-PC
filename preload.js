const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    init: () => ipcRenderer.send('init'), // init mainpage
    getMainpage: () => ipcRenderer.invoke('load-mainpage'), // get mainpage info 
    setWallpaper: (id) => ipcRenderer.send('set-wallpaper',id), // set wallpaper
    getcwd: () => ipcRenderer.invoke('get-cwd'), // get electron's cwd
    windowEvents: (type) => ipcRenderer.send('window-events',type), // windows events
    share: (id) => ipcRenderer.send('share',id),
    saveShare: (data) => ipcRenderer.send('save-share',data),
    backtoMainpage: () => ipcRenderer.send("back-to-mainpage"),
    goToPastDay: () => ipcRenderer.send("go-to-past-day")
});
