const path = require('path');
const { BrowserWindow, Menu, Tray, nativeImage, app } = require('electron');
const state = require('./state');

/**
 * 创建主窗口和托盘
 *
 * 若以 --hidden 参数启动（开机自启注册时附带），则主窗口不显示，仅驻留托盘。
 * Windows 无原生 openAsHidden，靠自定义命令行参数实现。
 */
async function createWindow() {
  // 开机自启会带 --hidden 参数；检测到则静默到托盘
  const startHidden = process.argv.includes('--hidden');

  state.mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    width: 1280,
    height: 720,
    icon: path.join(state.ROOT, "src/icons/dock.ico"),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
    frame: false,
    show: false
  });

  Menu.setApplicationMenu(null);

  // 加载页面
  if (!app.isPackaged) {
    const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    console.log('[Starte] Loading dev URL:', url);
    state.mainWindow.loadURL(url);
    state.mainWindow.webContents.openDevTools();
  } else {
    const prodPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('[Starte] Loading prod file:', prodPath);
    state.mainWindow.loadFile(prodPath);
  }

  // 非隐藏启动时显示窗口
  if (!startHidden) state.mainWindow.show();

  // 创建托盘
  const trayMenuTemplate = [
    {
      label: '打开主界面',
      icon: nativeImage.createFromPath(path.join(state.ROOT, "src/icons/toHome.png")),
      click: () => {
        state.mainWindow.show();
        state.mainWindow.webContents.executeJavaScript("window.$router && window.$router.push('/main')");
      }
    },
    {
      label: '投稿',
      icon: nativeImage.createFromPath(path.join(state.ROOT, "src/icons/toSubmission.png")),
      click: () => {
        state.mainWindow.show();
        state.mainWindow.webContents.executeJavaScript("window.$router && window.$router.push('/submission')");
      }
    },
    {
      label: '退出观星记',
      icon: nativeImage.createFromPath(path.join(state.ROOT, "src/icons/toExit.png")),
      click: () => {
        state.isQuitting = true;
        app.quit();
      }
    }
  ];

  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  state.appTray = new Tray(nativeImage.createFromPath(path.join(state.ROOT, "src/icons/dock.ico")));
  state.appTray.setToolTip('观星记 Starte');
  state.appTray.setContextMenu(trayMenu);
  state.appTray.on('click', () => state.mainWindow.show());
  state.appTray.on('right-click', () => state.appTray.popUpContextMenu(trayMenu));

  state.mainWindow.on('close', (e) => {
    if (!state.isQuitting) {
      e.preventDefault();
      state.mainWindow.hide();
    }
  });
}

module.exports = { createWindow };
