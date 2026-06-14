const path = require('path');
const { ipcMain, app } = require('electron');
const starte = require('../../packages/starte/index.js');

/**
 * 设置读写类 IPC（含开机自启处理）
 */
function register() {
  ipcMain.handle('get-setting', async (event, configName) => await starte.getSetting(configName));

  ipcMain.handle('set-setting', async (event, configName, value) => {
    // 本地磁盘写入失败极罕见：吞错 + log，避免渲染层裸 await 产生未捕获 rejection
    try {
      await starte.setSetting(configName, value);
    } catch (err) {
      console.error('写入设置失败:', configName, err);
      return { success: false, error: err.message };
    }

    // 处理开机自启
    const isSelfopen = await starte.getSetting("isSelfopen");
    try {
      if (isSelfopen === true) {
        const exeName = path.basename(process.execPath);
        app.setLoginItemSettings({
          openAtLogin: true,
          path: process.execPath,
          // --hidden：开机自启时静默到托盘（Windows 无原生 openAsHidden，靠自定义参数实现）
          args: ['--processStart', `"${exeName}"`, '--hidden']
        });
      } else if (isSelfopen === false) {
        app.setLoginItemSettings({ openAtLogin: false });
      }
    } catch (err) {
      console.error('设置开机自启失败:', err);
    }
  });
}

module.exports = register;
