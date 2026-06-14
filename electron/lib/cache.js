const fs = require('fs');
const path = require('path');
const state = require('./state');
const starte = require('../../packages/starte/index.js');

/**
 * 初始化缓存目录
 */
function initCacheDir() {
  const { CACHE_DIR } = state;
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(path.join(CACHE_DIR, 'config.json'))) {
    fs.writeFileSync(path.join(CACHE_DIR, 'config.json'), JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(path.join(CACHE_DIR, 'mainpage-cache.json'))) {
    fs.writeFileSync(path.join(CACHE_DIR, 'mainpage-cache.json'), JSON.stringify({}, null, 2));
  }
}

/**
 * 下载主页图片（带缓存检查）
 */
async function downloadMainpageImage(data) {
  const filename = `${data.id}.png`;
  const filePath = path.join(state.CACHE_DIR, filename);
  const cacheFile = path.join(state.CACHE_DIR, 'mainpage-cache.json');
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

  // 获取远程文件大小
  const remoteSize = await starte.getRemoteImageSize(data.url);

  // 检查缓存
  if (cache.date === data.date && starte.isCached(filename, remoteSize)) {
    console.log('使用缓存的主页图片');
    return filePath;
  }

  // 下载新图片
  console.log('下载主页图片:', data.url);
  await starte.downloadImage(data.url, filename);

  // 更新缓存记录
  cache.date = data.date;
  cache.size = remoteSize;
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));

  return filePath;
}

module.exports = { initCacheDir, downloadMainpageImage };
