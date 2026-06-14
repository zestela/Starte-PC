/**
 * 观星记 Starte
 * Copyright (c) 2022-2026, zestela.co.
 * 网站: https://zestela.co/starte/
 * 基于 MIT License 开源
 */
const { app, BrowserWindow, shell } = require('electron');

const { createWindow } = require('./lib/window');
const { infoToServer } = require('./lib/telemetry');
const { registerIpc } = require('./ipc');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

app.whenReady().then(async () => {
  // 注册所有 IPC handlers
  registerIpc();

  // 创建主窗口与托盘
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // 打包后上报遥测
  if (app.isPackaged) infoToServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (e, webContents) => {
  webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
