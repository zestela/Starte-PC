const path = require('path');
const fs = require('fs');
const { ipcMain } = require('electron');
const state = require('../lib/state');
const starte = require('../../packages/starte/index.js');
const { initCacheDir, downloadMainpageImage } = require('../lib/cache');

/**
 * 启动流程类 IPC
 */
function register() {
  // 拉主页数据
  ipcMain.handle('bootstrap', async () => {
    initCacheDir();

    const response = await fetch("https://api.zestela.co/new-mainpage/get-mainpage.php", {
      signal: AbortSignal.timeout(30000)
    });
    const mainpageData = await response.json();

    if (mainpageData.code !== 0) {
      return mainpageData.data;
    } else {
      console.log('本月无数据');
      throw new Error('NO_DATA');
    }
  });

  // 下载主页图片到缓存（带缓存检查）。失败返回 { success:false }，不阻断启动
  ipcMain.handle('ensure-mainpage-image', async (event, data) => {
    try {
      await downloadMainpageImage(data);
      return { success: true };
    } catch (err) {
      console.error('主页图片下载失败:', err);
      return { success: false, error: err.message };
    }
  });

  // 开机自启时设壁纸。依赖 ensure-mainpage-image 已下载（并行触发，图片可能尚未就绪则跳过）
  ipcMain.handle('apply-startup-wallpaper', async (event, data) => {
    try {
      const isSelfopen = await starte.getSetting("isSelfopen");
      if (isSelfopen !== true) return { success: true, skipped: true };

      const imagePath = path.join(state.CACHE_DIR, `${data.id}.png`);
      if (!fs.existsSync(imagePath)) {
        console.warn('开机壁纸：图片尚未下载，跳过');
        return { success: false, error: 'image not ready' };
      }
      await starte.setWallpaper(imagePath);
      return { success: true };
    } catch (err) {
      console.warn('开机壁纸设置失败:', err.message);
      return { success: false, error: err.message };
    }
  });
}

module.exports = register;
