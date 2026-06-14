const { ipcMain } = require('electron');
const state = require('../lib/state');

/**
 * 系统信息类 IPC（纯数据获取，直接返回值）
 */
function register() {
  ipcMain.handle('get-version', () => state.APP_VERSION);
  ipcMain.handle('get-machine-id', () => require("node-machine-id").machineIdSync({ original: true }));
}

module.exports = register;
