const path = require('path');
const { BrowserWindow, app } = require('electron');
const state = require('./state');

// 编译后所有文件在 dist-electron/，preload.js 也在同一目录
const PRELOAD_PATH = path.join(__dirname, 'preload.js');

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
 * 统一创建弹窗窗口
 *
 * 为了避免"复用到之前 preload 路径错误的旧窗口"（会导致 window.electronAPI 不存在，
 * Vue 读到默认值 → 内容空、按钮默认"复制+知道了"），每次都销毁旧窗口后重建。
 */
function createPopupWindow() {
  // 先销毁已有的旧窗口，防止复用一个 preload 不对的窗口
  if (state.popupWindow && !state.popupWindow.isDestroyed()) {
    state.popupWindow.removeAllListeners('closed');
    state.popupWindow.destroy();
  }
  state.popupWindow = null;

  state.popupWindow = new BrowserWindow({
    width: 520,
    height: 380,
    minWidth: 400,
    minHeight: 280,
    frame: false,
    parent: state.mainWindow,
    modal: true,
    hasShadow: true,
    webPreferences: { preload: PRELOAD_PATH },
    resizable: true,
    show: false
  });
}

/**
 * 在内容加载完成后显示窗口
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
 * 显示普通提示弹窗（复制+知道了）
 */
function reportError(errorMsg) {
  state.popupMsgType = 'info';
  state.popupMsg = errorMsg;
  state.popupMsgData = null;
  state.closePromptCallback = null;

  createPopupWindow();

  // 用户关窗口 → 清引用
  state.popupWindow.on('closed', () => { state.popupWindow = null; });

  loadPopupContent(state.popupWindow);
  showWhenReady(state.popupWindow);
}

/**
 * 显示选择型弹窗（多个按钮 + 回调）
 */
function showChoicePrompt(config, callback) {
  state.popupMsgType = 'choice';
  state.popupMsg = config.msg;
  state.popupMsgData = { title: config.title, choices: config.choices };
  state.closePromptCallback = callback;

  createPopupWindow();

  // 用户直接关窗口（没点按钮）→ 默认收起到托盘
  state.popupWindow.on('closed', () => {
    state.popupWindow = null;
    const cb = state.closePromptCallback;
    state.closePromptCallback = null;
    if (cb) cb('tray');
  });

  loadPopupContent(state.popupWindow);
  showWhenReady(state.popupWindow);
}

module.exports = { reportError, showChoicePrompt };
