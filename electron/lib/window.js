const path = require('path');
const fs = require('fs');
const { BrowserWindow, Menu, Tray, nativeImage, app } = require('electron');
const state = require('./state');
const { showChoicePrompt } = require('./error-popup');

/**
 * 同步读取完整 config
 */
function readConfig() {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(state.CACHE_DIR, 'config.json'), 'utf8')
    );
  } catch (e) {
    return {};
  }
}

/**
 * 同步写入 config
 */
function writeConfig(config) {
  try {
    fs.writeFileSync(
      path.join(state.CACHE_DIR, 'config.json'),
      JSON.stringify(config, null, 2)
    );
    return true;
  } catch (e) {
    console.error('写入 config 失败:', e);
    return false;
  }
}

/**
 * 同步读取关闭行为设置
 * 注意：只有 config 里显式存在 closeBehavior 才认为"用户已选过"
 * 如果是首次用户（config 里没有 closeBehavior），会弹窗询问
 */
function getCloseBehavior() {
  const config = readConfig();
  return config.closeBehavior; // 可能是 'tray' | 'quit' | undefined
}

/**
 * 首次关闭时提醒用户选择关闭行为（使用自定义样式弹窗）
 */
function showFirstClosePrompt(onDone) {
  showChoicePrompt({
    title: '关闭提示',
    msg: '关闭窗口时你希望观星记如何处理？<br><br>' +
         '<b>收起到托盘</b>：窗口隐藏，可随时从托盘重新打开<br>' +
         '<b>退出程序</b>：完全关闭应用<br><br>' +
         '之后可以随时在「设置」中修改。',
    choices: [
      { key: 'tray', label: '收起到托盘' },
      { key: 'quit', label: '退出程序' }
    ]
  }, (choice) => {
    // 无论用户选择什么，都写入 config（避免反复弹）
    const config = readConfig();
    config.closeBehavior = choice;
    writeConfig(config);
    onDone(choice);
  });
}

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
    if (state.isQuitting) return;
    e.preventDefault();

    const savedBehavior = getCloseBehavior();

    if (savedBehavior) {
      if (savedBehavior === 'quit') {
        state.isQuitting = true;
        app.quit();
      } else {
        state.mainWindow.hide();
      }
      return;
    }

    showFirstClosePrompt((choice) => {
      if (choice === 'quit') {
        state.isQuitting = true;
        app.quit();
      } else {
        state.mainWindow.hide();
      }
    });
  });
  
  return state.mainWindow;
}

module.exports = { createWindow };
