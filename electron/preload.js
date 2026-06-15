/**
 *
    观星记 Starte
    Copyright (c) 2022-2026, zestela.co.
    网站: https://zestela.co/starte/
    基于 MIT License 开源
    任何根据 MIT License 修改和研究的版本都必须保留本注释, 否则视为未遵守开源协议
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    bootstrap: () => ipcRenderer.invoke('bootstrap'),
    ensureMainpageImage: (data) => ipcRenderer.invoke('ensure-mainpage-image', data),
    applyStartupWallpaper: (data) => ipcRenderer.invoke('apply-startup-wallpaper', data),
    setWallpaper: (id) => ipcRenderer.invoke('set-wallpaper', id),
    windowEvents: (type) => ipcRenderer.send('window-events', type),
    share: (id) => ipcRenderer.invoke('share', id),
    saveShare: (data) => ipcRenderer.invoke('save-share', data),
    outAlert: (str) => ipcRenderer.send('out-alert', str),
    getVersion: () => ipcRenderer.invoke('get-version'),
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),
    getSetting: (name) => ipcRenderer.invoke('get-setting', name),
    setSetting: (name, value) => ipcRenderer.invoke('set-setting', name, value),
    popupClose: () => ipcRenderer.send('pop-up-close'),
    getPopupMsg: () => ipcRenderer.invoke('get-popup-msg'),
    getPopupType: () => ipcRenderer.invoke('get-popup-type'),
    getPopupData: () => ipcRenderer.invoke('get-popup-data'),
    popupSendChoice: (choice) => ipcRenderer.send('popup-send-choice', choice),
    apiFetch: (url, options) => ipcRenderer.invoke('api-fetch', url, options || {}),
    readCacheFile: (filename) => ipcRenderer.invoke('read-cache-file', filename),
    
    // 更新相关
    checkUpdate: () => ipcRenderer.invoke('check-update'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    
    // 事件监听
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
    removeUpdateStatusListener: (callback) => ipcRenderer.removeListener('update-status', callback)
});
