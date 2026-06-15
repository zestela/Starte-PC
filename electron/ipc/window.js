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

  // 读取弹窗类型（供 popup 决定显示什么按钮）
  ipcMain.handle('get-popup-type', () => state.popupMsgType || 'info');

  // 读取弹窗数据（供选择型弹窗用）
  ipcMain.handle('get-popup-data', () => state.popupMsgData || null);

  // 弹窗内点击选择按钮：先取走 callback，再关窗口（避免 closed 事件抢掉）
  ipcMain.on('popup-send-choice', (event, choice) => {
    const cb = state.closePromptCallback;
    state.closePromptCallback = null;
    if (state.popupWindow && !state.popupWindow.isDestroyed()) {
      state.popupWindow.removeAllListeners('closed');
      state.popupWindow.close();
    }
    if (cb) cb(choice);
  });
}

module.exports = register;
