/**
 * 全局共享状态与常量
 */
const path = require('path');
const { app } = require('electron');

module.exports = {
  // 可变状态
  mainWindow: null,
  popupWindow: null,
  appTray: null,
  popupMsg: undefined,
  isQuitting: false,

  // 常量
  // app.getVersion() 需在 app ready 后调用才稳定，用 getter 延迟到首次读取。
  get APP_VERSION() { return app.getVersion(); },
  // 运行时 __dirname 为打包输出目录 dist-electron/，回退一层到项目根
  ROOT: path.join(__dirname, '..'),
  CACHE_DIR: path.join(process.env.APPDATA, 'starte-cache'),
};
