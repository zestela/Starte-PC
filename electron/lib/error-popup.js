const path = require('path');
const { BrowserWindow, app } = require('electron');
const state = require('./state');

/**
 * 加载/重新加载弹窗内容（Vue 应用的 popup 路由）
 */
function loadPopupContent(win) {
  if (!app.isPackaged) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    win.loadURL(devUrl + '/#/popup');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { hash: '/popup' });
  }
}

/**
 * 在内容加载完成后显示窗口，避免复用场景下闪现旧内容
 */
function showWhenReady(win) {
  if (win.webContents.isLoading()) {
    win.webContents.once('did-finish-load', () => {
      if (!win.isDestroyed()) win.show();
    });
  } else {
    win.show();
  }
}

/**
 * 显示错误弹窗
 *
 * 重入幂等：连续报错时复用已有窗口并重新加载（刷新消息），避免 close()/重建的竞态导致孤儿窗口。
 */
function reportError(errorMsg) {
  state.popupMsg = errorMsg;

  // 已有未销毁的弹窗：复用，重新加载以刷新消息
  if (state.popupWindow && !state.popupWindow.isDestroyed()) {
    loadPopupContent(state.popupWindow);
    showWhenReady(state.popupWindow);
    return;
  }

  state.popupWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    parent: state.mainWindow,
    modal: true,
    hasShadow: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    resizable: false,
    show: false
  });

  // 窗口销毁后清理引用，避免持有已关闭窗口
  state.popupWindow.on('closed', () => { state.popupWindow = null; });

  loadPopupContent(state.popupWindow);
  showWhenReady(state.popupWindow);
}

module.exports = { reportError };
