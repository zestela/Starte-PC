const { ipcMain } = require('electron');
const state = require('../lib/state');
const { reportError } = require('../lib/error-popup');

/**
 * 窗口与弹窗类 IPC
 */
function register() {
  // 窗口操作
  ipcMain.on('window-events', (event, type) => {
    if (type === 1) state.mainWindow.minimize();
    else if (type === 2) state.mainWindow.isMaximized() ? state.mainWindow.unmaximize() : state.mainWindow.maximize();
    else if (type === 3) state.mainWindow.close();
  });

  // 弹出提示（触发错误弹窗）
  ipcMain.on('out-alert', (event, str) => reportError(str));

  // 关闭弹窗
  ipcMain.on('pop-up-close', () => { if (state.popupWindow) state.popupWindow.close(); });

  // 读取弹窗消息（供 popup 渲染层取用）
  ipcMain.handle('get-popup-msg', () => state.popupMsg);
}

module.exports = register;
