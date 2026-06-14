const fs = require('fs');
const path = require('path');
const { ipcMain, dialog } = require('electron');
const state = require('../lib/state');
const starte = require('../../packages/starte/index.js');

/**
 * 图片媒体类 IPC（读/写/分享）
 */
function register() {
  // 读取缓存图片（返回 base64 data URL）
  ipcMain.handle('read-cache-file', async (event, filename) => {
    const filePath = path.join(state.CACHE_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) throw new Error('File not found');

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/png';

    return `data:${mime};base64,${buffer.toString('base64')}`;
  });

  // 分享（下载图片到缓存）
  ipcMain.handle('share', async (event, shareId) => {
    try {
      const response = await fetch(
        `https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=${shareId}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();

      if (data.code !== 1) return { success: false, error: 'FETCH_FAILED' };

      const filename = `${shareId}.png`;
      const remoteSize = await starte.getRemoteImageSize(data.data.url);

      // 检查缓存
      if (starte.isCached(filename, remoteSize)) {
        console.log('分享图片已缓存');
        return { success: true };
      }

      // 下载图片
      console.log('下载分享图片:', data.data.url);
      await starte.downloadImage(data.data.url, filename);
      return { success: true };
    } catch (err) {
      console.error('share handler error:', err);
      return { success: false, error: err.message };
    }
  });

  // 设置壁纸（按 ID）
  ipcMain.handle('set-wallpaper', async (event, id) => await starte.setWallPaperOut(id));

  // 保存分享截图
  ipcMain.handle('save-share', async (event, data) => {
    const dataBuffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const { filePath } = await dialog.showSaveDialog({
      filters: [{ name: 'img', extensions: ['jpeg'] }]
    });
    if (filePath) {
      fs.writeFileSync(filePath, dataBuffer);
      return { success: true };
    }
    return { success: false, cancelled: true };
  });
}

module.exports = register;
