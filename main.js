require('v8-compile-cache');
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
const axios = require('axios');
const ufs = require("./packages/url-file-size/index.js");
const starte = require("./packages/starte/index.js");
let mainWindow;
let mainpageRendererData = {};
let appTray = null;

function reportError(errorMsg) {
  let options = {
    type: 'warning',
    buttons: ["确定"],
    defaultId: 0,
    cancelId: 0,
    detail: errorMsg,
    message: ''
  };
  dialog.showMessageBoxSync(null, options);
}

async function infoToServer() {
  if (app.isPackaged) {
    const userVersion = require("./package.json").version;
    const userOS = os.version().replace(/ /g, '%20') + "%20" + os.release().replace(/ /g, '%20'); //获取电脑系统版本，replace是为了把空格替换成%20，否则api链接会在空格处断开
    const getipAddress = await axios.get('https://ipapi.co/json/', { timeout: 5000 })
      .catch(function (error) {
        const errorMsg = "向服务器存储数据时出现错误，请向我们反馈错误信息：" + error;
        reportError(errorMsg);
      });
    const ipAddress = getipAddress.data.ip;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uniqueUserSession = String(ipAddress.replace(/\./g, '') + Math.floor(Math.random() * 100) + timestamp % 1000).replace(/\./g, '');
    const getUrl = `https://api.discoverse.space/info/analysis.php?getip=${ipAddress}&getuseTime=${timestamp}&getdeviceId=${require("node-machine-id").machineIdSync({ original: true })}&getuseSystem=${userOS}&getuseVersion=${userVersion}&uniqueUserSession=${uniqueUserSession}`;
    console.log(getUrl);
    let sendInfoResult = await axios.get(getUrl, {
      timeout: 5000
    }).catch(function (error) {
      reportError("向服务器存储数据时出现错误，请向我们反馈错误信息：" + error);
    });
    sendInfoResult = sendInfoResult.data;
    if (sendInfoResult.code == 1) return 0;
    else reportError("向服务器存储数据时出现错误，请向我们反馈错误信息：" + sendInfoResult.msg);
  } else {
    return 0;
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    width: 1280,
    height: 720,
    icon: "./src/icons/dock.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    show: false
  });
  Menu.setApplicationMenu(null);
  await mainWindow.loadFile('src/loading.html');
  mainWindow.show();
  if (!app.isPackaged) mainWindow.webContents.openDevTools();

  let trayMenuTemplate = [{
    label: '打开主界面',
    icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toHome.png")),
    click: function () {
      mainWindow.loadFile("src/index.html");
      mainWindow.show();
    }
  },
  {
    label: '投稿',
    icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toSubmission.png")),
    click: function () {
      mainWindow.loadFile("src/submission.html");
      mainWindow.show();
    }
  },
  {
    label: '退出观星记',
    icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toExit.png")),
    click: function () {
      app.quit();
      app.quit();  // 因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
    }
  }
  ];
  appTray = new Tray(nativeImage.createFromPath(path.join(__dirname, "src/icons/dock.ico")));
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  appTray.setToolTip('观星记 Starte');
  appTray.setContextMenu(contextMenu);
  appTray.on('click', function () {
    mainWindow.show();
  });
  appTray.on('right-click', () => {
    appTray.popUpContextMenu(trayMenuTemplate);
  });

}

app.whenReady().then(async () => {
  ipcMain.handle('get-cwd', () => {
    return process.cwd().replaceAll("\\", "/");
  });

  ipcMain.handle('get-appdata', () => {
    return process.env.APPDATA.replaceAll("\\", "/");
  });

  ipcMain.handle('get-shareId', () => {
    return shareId;
  });

  ipcMain.handle('get-shareType', () => {
    return shareType;
  });

  ipcMain.handle('get-version', () => {
    return require("./package.json").version;
  });

  ipcMain.handle('get-mainpage-data', () => {
    return mainpageRendererData;
  });

  ipcMain.handle('get-setting', async (event, configName) => {
    return await starte.getSetting(configName);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  infoToServer();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (e, webContents) => {
  webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

ipcMain.on('init', async () => {
  if (!fs.existsSync(path.join(process.env.APPDATA, "starte-cache")))
    fs.mkdirSync(path.join(process.env.APPDATA, "starte-cache"));
  if (!fs.existsSync(path.join(process.env.APPDATA, "starte-cache", "config.json")))
    fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify({}));
  if (!fs.existsSync(path.join(process.env.APPDATA, "starte-cache", "mainpage-cache.json")))
    fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "mainpage-cache.json"), JSON.stringify({}));

  const ifOpenConfig = await starte.getSetting("isSelfopen");
  let mainpageCache = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "mainpage-cache.json")));

  let mainpageData = await axios.get("https://api.discoverse.space/new-mainpage/get-mainpage", {
    timeout: 10000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });

  mainpageData = mainpageData.data;
  mainpageRendererData = mainpageData.data;

  if (mainpageData.code !== 0) {
    let filename = path.join(process.env.APPDATA, "starte-cache", mainpageData.data.id + ".png");
    if (mainpageCache.date != mainpageData.data.date || !fs.existsSync(filename) || (mainpageCache.size != fs.statSync(filename).size)) {
      console.log("Log: start downloading");

      mainpageCache.date = mainpageData.data.date;
      mainpageCache.size = await ufs(mainpageData.data.url);
      fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "mainpage-cache.json"), JSON.stringify(mainpageCache));

      starte.downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
        .finally(() => {
          console.log("Log: download successfully");
          mainWindow.loadFile('src/index.html');
        });
      if (ifOpenConfig == true) starte.setWallpaper(filename);
    } else {
      console.log("Log: load cache successfully");
      await mainWindow.loadFile('src/index.html');
    }
  } else {
    console.log("Log: there is no data of this month");
    await mainWindow.loadFile('src/timeout.html');
  }
});

ipcMain.on('window-events', (event, type) => {
  if (type === 1)
    mainWindow.minimize();
  else if (type === 2) {
    if (mainWindow.isMaximized())
      mainWindow.unmaximize();
    else
      mainWindow.maximize();
  } else if (type === 3) mainWindow.hide();
});

let shareId = 0;
let shareType = 0;
ipcMain.on('share', async (event, id, type) => {
  shareId = id;
  shareType = type;
  let shareData = await axios.get("https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
    timeout: 10000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  shareData = shareData.data;

  ufs(shareData.data.url)
    .finally(async (fileSize) => {
      if (shareData.code !== 0) {
        let filename = path.join(process.env.APPDATA, "starte-cache", shareId + ".png");
        if (!fs.existsSync(filename) || (fileSize != fs.statSync(filename).size)) {
          starte.downloadImage(shareData.data.url, shareId + ".png")
            .finally(async () => {
              await mainWindow.loadFile('src/share.html');
            });
        } else await mainWindow.loadFile('src/share.html');
      }
    });
});

ipcMain.on('set-wallpaper', async (event, id) => {
  starte.setWallPaperOut(id);
});

ipcMain.on('save-share', async (event, data) => {
  let dataBuffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  let filePath = dialog.showSaveDialogSync({
    filters: [{
      name: 'img',
      extensions: ['jpeg']
    }]
  });
  if(filePath != undefined)
    fs.writeFile(filePath, dataBuffer, () => { });
});

ipcMain.on("go-to-page", async (event, pageId) => {
  switch (pageId) {
    case 1:
      await mainWindow.loadFile("src/index.html");
      break;
    case 2:
      await mainWindow.loadFile("src/wallpaper-list.html");
      break;
    case 3:
      await mainWindow.loadFile("src/settings.html");
      break;
    case 4:
      await mainWindow.loadFile("src/settings-about.html");
      break;
    case 5:
      await mainWindow.loadFile("src/timeout.html");
      break;
    case 6:
      await mainWindow.loadFile("src/star-watching.html");
      break;
    case 7:
      await mainWindow.loadFile("src/submission.html");
      break;
    case 8:
      await mainWindow.loadFile("src/check-new.html");
      break;
    case 9:
      await mainWindow.loadFile("src/vwo50.html");
      break;
    case 10:
      await mainWindow.loadFile("src/vicissitudes.html");
      break;
  }
});

ipcMain.on("out-alert", async (event, str) => {
  reportError(str);
});

ipcMain.on("set-setting", async (event, configName, value) => {
  starte.setSetting(configName, value);

  const ifOpenConfig = starte.getSetting("isSelfopen");
  if (ifOpenConfig == true) {
    try {
      const exeName = path.basename(process.execPath);
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: process.execPath,
        args: [
          '--processStart', `"${exeName}"`,
        ]
      });
    } catch (err) {
      console.log(err);
    }
  } else if (ifOpenConfig == false) {
    try {
      app.setLoginItemSettings({
        openAtLogin: false
      });
    } catch (err) {
      console.log(err);
    }
  }
});