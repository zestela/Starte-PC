/**
 *
    观星记 Starte
    Copyright (c) 2022-2023, zestela.co.
    网站: https://zestela.co/starte/
    基于 MIT License 开源
    任何根据 MIT License 修改和研究的版本都必须保留本注释, 否则视为未遵守开源协议
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // 初始化：创建缓存目录、拉取主页数据、下载图片，返回 { ok: true } 或抛出错误
    init: () => ipcRenderer.invoke('init'),

    // 设置壁纸（按 ID）
    setWallpaper: (id) => ipcRenderer.invoke('set-wallpaper', id),

    // 窗口操作
    windowEvents: (type) => ipcRenderer.send('window-events', type),

    // 分享（下载图片并返回结果），type: 0=壁纸 1=句子
    share: (id, type) => ipcRenderer.invoke('share', id, type),

    // 保存分享截图
    saveShare: (data) => ipcRenderer.invoke('save-share', data),

    // 弹出提示
    outAlert: (str) => ipcRenderer.send('out-alert', str),

    // 数据获取
    getcwd: () => ipcRenderer.invoke('get-cwd'),
    getappdata: () => ipcRenderer.invoke('get-appdata'),
    getVersion: () => ipcRenderer.invoke('get-version'),
    getMainpageData: () => ipcRenderer.invoke('get-mainpage-data'),
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),

    // 设置读写
    getSetting: (name) => ipcRenderer.invoke('get-setting', name),
    setSetting: (name, value) => ipcRenderer.send('set-setting', name, value),

    // 弹窗专用
    popupClose: () => ipcRenderer.send('pop-up-close'),
    getPopupMsg: () => ipcRenderer.invoke('get-popup-msg'),

    // API 请求（统一走后端，避免前端 CORS）
    apiFetch: (url, options) => ipcRenderer.invoke('api-fetch', url, options || {}),

    // 读取缓存图片（返回 base64 data URL，绕过浏览器 file:// 限制）
    readCacheFile: (filename) => ipcRenderer.invoke('read-cache-file', filename),
});
