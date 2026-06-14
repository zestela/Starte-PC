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
    // 启动：拉取主页数据（直接返回 data，失败 reject）
    bootstrap: () => ipcRenderer.invoke('bootstrap'),

    // 启动：确保主页图片已下载到缓存（失败不阻断启动）
    ensureMainpageImage: (data) => ipcRenderer.invoke('ensure-mainpage-image', data),

    // 启动：开机自启时设壁纸（失败不阻断启动）
    applyStartupWallpaper: (data) => ipcRenderer.invoke('apply-startup-wallpaper', data),

    // 设置壁纸（按 ID）
    setWallpaper: (id) => ipcRenderer.invoke('set-wallpaper', id),

    // 窗口操作
    windowEvents: (type) => ipcRenderer.send('window-events', type),

    // 分享（下载图片并返回结果）
    share: (id) => ipcRenderer.invoke('share', id),

    // 保存分享截图
    saveShare: (data) => ipcRenderer.invoke('save-share', data),

    // 弹出提示
    outAlert: (str) => ipcRenderer.send('out-alert', str),

    // 数据获取
    getVersion: () => ipcRenderer.invoke('get-version'),
    getMachineId: () => ipcRenderer.invoke('get-machine-id'),

    // 设置读写
    getSetting: (name) => ipcRenderer.invoke('get-setting', name),
    setSetting: (name, value) => ipcRenderer.invoke('set-setting', name, value),

    // 弹窗专用
    popupClose: () => ipcRenderer.send('pop-up-close'),
    getPopupMsg: () => ipcRenderer.invoke('get-popup-msg'),

    // API 请求（统一走后端，避免前端 CORS）
    apiFetch: (url, options) => ipcRenderer.invoke('api-fetch', url, options || {}),

    // 读取缓存图片（返回 base64 data URL，绕过浏览器 file:// 限制）
    readCacheFile: (filename) => ipcRenderer.invoke('read-cache-file', filename),
});
