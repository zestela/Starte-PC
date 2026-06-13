/**
 * 观星记 Starte
 * Copyright (c) 2022-2023, zestela.co.
 * 网站: https://zestela.co/starte/
 * 基于 MIT License 开源
 */
const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
  Tray,
  nativeImage
} = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const starte = require("../packages/starte/index.js");

let mainWindow;
let popupWindow;
let mainpageRendererData = {};
let appTray = null;
let popupMsg;
let isQuitting = false;

const APP_VERSION = app.getVersion();
const ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(process.env.APPDATA, 'starte-cache');

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

/**
 * 显示错误弹窗
 */
function reportError(errorMsg) {
  popupMsg = errorMsg;
  if (popupWindow && !popupWindow.isDestroyed()) popupWindow.close();

  popupWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    parent: mainWindow,
    modal: true,
    hasShadow: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    resizable: false,
    show: false
  });

  popupWindow.loadFile(path.join(ROOT, 'src/popup.html'));
  popupWindow.show();
}

/**
 * 发送遥测数据到服务器
 */
async function infoToServer() {
  const errorMsg = "遥测模块出现错误。向<a href='https://zestela.co/support/' target='_blank'>此处</a>反馈<br>错误信息：";

  try {
    const ipData = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(20000) }).then(r => r.json());
    const url = `https://api.zestela.co/info/analysis.php?getip=${ipData.ip}&getuseTime=${Math.round(Date.now() / 1000)}&getdeviceId=${require("node-machine-id").machineIdSync({ original: true })}&getuseSystem=${os.release().replace(/ /g, '%20')}&getuseVersion=${APP_VERSION}`;

    const result = await fetch(url, { signal: AbortSignal.timeout(30000) }).then(r => r.json());
    if (result.code !== 1) reportError(errorMsg + result.msg);
  } catch (error) {
    reportError(errorMsg + error.message);
  }
}

/**
 * 创建主窗口和托盘
 */
async function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    width: 1280,
    height: 720,
    icon: path.join(ROOT, "src/icons/dock.ico"),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    frame: false,
    show: false
  });

  Menu.setApplicationMenu(null);

  // 加载页面
  if (!app.isPackaged) {
    const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('[Starte] Loading dev URL:', url);
    mainWindow.loadURL(url);
    mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path.join(__dirname, '../dist/index.html');
    console.log('[Starte] Loading prod file:', prodPath);
    mainWindow.loadFile(prodPath);
  }

  mainWindow.show();

  // 创建托盘
  const trayMenuTemplate = [
    {
      label: '打开主界面',
      icon: nativeImage.createFromPath(path.join(ROOT, "src/icons/toHome.png")),
      click: () => {
        mainWindow.show();
        mainWindow.webContents.executeJavaScript("window.$router && window.$router.push('/main')");
      }
    },
    {
      label: '投稿',
      icon: nativeImage.createFromPath(path.join(ROOT, "src/icons/toSubmission.png")),
      click: () => {
        mainWindow.show();
        mainWindow.webContents.executeJavaScript("window.$router && window.$router.push('/submission')");
      }
    },
    {
      label: '退出观星记',
      icon: nativeImage.createFromPath(path.join(ROOT, "src/icons/toExit.png")),
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ];

  appTray = new Tray(nativeImage.createFromPath(path.join(ROOT, "src/icons/dock.ico")));
  appTray.setToolTip('观星记 Starte');
  appTray.setContextMenu(Menu.buildFromTemplate(trayMenuTemplate));
  appTray.on('click', () => mainWindow.show());
  appTray.on('right-click', () => appTray.popUpContextMenu(trayMenuTemplate));

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

/**
 * 初始化缓存目录
 */
function initCacheDir() {
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
  const filePath = path.join(CACHE_DIR, filename);
  const cacheFile = path.join(CACHE_DIR, 'mainpage-cache.json');
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

// ==================== IPC Handlers ====================

app.whenReady().then(async () => {
  // 简单数据获取
  ipcMain.handle('get-cwd', () => process.cwd().replaceAll("\\", "/"));
  ipcMain.handle('get-appdata', () => process.env.APPDATA.replaceAll("\\", "/"));
  ipcMain.handle('get-version', () => APP_VERSION);
  ipcMain.handle('get-mainpage-data', () => mainpageRendererData);
  ipcMain.handle('get-machine-id', () => require("node-machine-id").machineIdSync({ original: true }));
  ipcMain.handle('get-popup-msg', () => popupMsg);

  // 设置读写
  ipcMain.handle('get-setting', async (event, configName) => await starte.getSetting(configName));
  ipcMain.on('set-setting', async (event, configName, value) => {
    await starte.setSetting(configName, value);

    // 处理开机自启
    const isSelfopen = await starte.getSetting("isSelfopen");
    try {
      if (isSelfopen === true) {
        const exeName = path.basename(process.execPath);
        app.setLoginItemSettings({
          openAtLogin: true,
          openAsHidden: true,
          path: process.execPath,
          args: ['--processStart', `"${exeName}"`]
        });
      } else if (isSelfopen === false) {
        app.setLoginItemSettings({ openAtLogin: false });
      }
    } catch (err) {
      console.error('设置开机自启失败:', err);
    }
  });

  // 读取缓存图片
  ipcMain.handle('read-cache-file', async (event, filename) => {
    const filePath = path.join(CACHE_DIR, path.basename(filename));
    if (!fs.existsSync(filePath)) throw new Error('File not found');

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp' }[ext] || 'image/png';

    return `data:${mime};base64,${buffer.toString('base64')}`;
  });

  // 统一 API 代理
  ipcMain.handle('api-fetch', async (event, url, options) => {
    const allowed = ['api.zestela.co', 'afdian.com'];
    try {
      const parsed = new URL(url);
      if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
        throw new Error(`Blocked domain: ${parsed.hostname}`);
      }
    } catch (e) {
      if (e.message.startsWith('Blocked domain:')) throw e;
      throw new Error(`Invalid URL: ${url}`);
    }

    const timeout = options?.timeout || 15000;
    const fetchOptions = { ...options, signal: AbortSignal.timeout(timeout) };
    delete fetchOptions.timeout;

    // 恢复 FormData
    if (fetchOptions._bodyBase64) {
      fetchOptions.body = Buffer.from(fetchOptions._bodyBase64, 'base64');
      delete fetchOptions._bodyBase64;
    }
    if (fetchOptions._headers) {
      fetchOptions.headers = fetchOptions._headers;
      delete fetchOptions._headers;
    }

    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  });

  // 初始化
  ipcMain.handle('init', async () => {
    initCacheDir();

    const response = await fetch("https://api.zestela.co/new-mainpage/get-mainpage.php", {
      signal: AbortSignal.timeout(30000)
    });
    const mainpageData = await response.json();

    if (mainpageData.code !== 0) {
      mainpageRendererData = mainpageData.data;

      // 下载主页图片
      const imagePath = await downloadMainpageImage(mainpageData.data);

      // 如果启用了开机自启，设置壁纸
      const isSelfopen = await starte.getSetting("isSelfopen");
      if (isSelfopen === true) {
        await starte.setWallpaper(imagePath);
      }

      return { ok: true };
    } else {
      console.log('本月无数据');
      throw new Error('NO_DATA');
    }
  });

  // 分享（下载图片）
  ipcMain.handle('share', async (event, shareId, shareType) => {
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

  // 窗口操作
  ipcMain.on('window-events', (event, type) => {
    if (type === 1) mainWindow.minimize();
    else if (type === 2) mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
    else if (type === 3) mainWindow.close();
  });

  // 其他操作
  ipcMain.on('out-alert', (event, str) => reportError(str));
  ipcMain.handle('set-wallpaper', async (event, id) => await starte.setWallPaperOut(id));
  ipcMain.on('pop-up-close', () => { if (popupWindow) popupWindow.close(); });

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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (app.isPackaged) infoToServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (e, webContents) => {
  webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
