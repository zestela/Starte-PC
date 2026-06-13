const fs = require("fs");
const path = require("path");
const { Readable } = require('stream');
const wallpaper = require('wallpaper');

const CACHE_DIR = path.join(process.env.APPDATA, 'starte-cache');

/**
 * 下载图片到缓存目录
 * @param {string} url - 图片 URL
 * @param {string} filename - 文件名（仅文件名，不含路径）
 * @returns {Promise<string>} 返回文件完整路径
 */
async function downloadImage(url, filename) {
  const cachePath = path.join(CACHE_DIR, filename);
  const writer = fs.createWriteStream(cachePath);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  Readable.fromWeb(response.body).pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(cachePath));
    writer.on('error', reject);
  });
}

/**
 * 检查缓存文件是否存在且大小匹配
 * @param {string} filename - 文件名
 * @param {number} expectedSize - 期望大小（字节）
 * @returns {boolean}
 */
function isCached(filename, expectedSize) {
  const filePath = path.join(CACHE_DIR, filename);
  if (!fs.existsSync(filePath)) return false;
  if (!expectedSize) return true; // 不检查大小
  return fs.statSync(filePath).size === expectedSize;
}

/**
 * 获取远程图片的文件大小（HEAD 请求）
 * @param {string} url - 图片 URL
 * @returns {Promise<number>}
 */
async function getRemoteImageSize(url) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      const size = parseInt(res.headers['content-length'] || '0', 10);
      resolve(size);
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * 设置 Windows 桌面壁纸
 * @param {string} imagePath - 图片完整路径
 */
async function setWallpaper(imagePath) {
  if (process.platform !== "win32") {
    console.log('非 Windows 系统，跳过壁纸设置');
    return;
  }

  try {
    await wallpaper.set(imagePath, { scale: 'fill' });
    console.log('壁纸设置成功:', imagePath);
  } catch (err) {
    console.error('设置壁纸失败:', err.message);
  }
}

/**
 * 根据 ID 设置壁纸（从 API 获取数据并下载）
 * @param {string} id - 壁纸 ID
 */
async function setWallPaperOut(id) {
  try {
    const response = await fetch(
      `https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=${id}`,
      { signal: AbortSignal.timeout(30000) }
    );
    const data = await response.json();

    if (data.code !== 1) {
      console.log('获取壁纸数据失败, code:', data.code);
      return { success: false, error: 'FETCH_FAILED' };
    }

    const filename = `${id}.png`;
    const filePath = path.join(CACHE_DIR, filename);

    // 检查缓存
    if (fs.existsSync(filePath)) {
      console.log('使用缓存的壁纸:', filePath);
      await setWallpaper(filePath);
      return { success: true };
    }

    // 下载并设置
    console.log('下载壁纸:', data.data.url);
    const downloadedPath = await downloadImage(data.data.url, filename);
    await setWallpaper(downloadedPath);
    return { success: true };
  } catch (error) {
    console.error('setWallPaperOut 错误:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 读取设置
 * @param {string} configName - 配置项名称
 * @returns {Promise<any>}
 */
async function getSetting(configName) {
  const configPath = path.join(CACHE_DIR, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config[configName];
}

/**
 * 写入设置
 * @param {string} configName - 配置项名称
 * @param {any} value - 配置值
 */
async function setSetting(configName, value) {
  console.log('设置配置:', configName, value);
  const configPath = path.join(CACHE_DIR, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config[configName] = value;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  downloadImage,
  isCached,
  getRemoteImageSize,
  setWallpaper,
  setWallPaperOut,
  getSetting,
  setSetting
};
