/**
 *
    观星记 Starte
    Copyright (c) 2022-2023, zestela.co.
    网站: https://zestela.co/starte/
    基于 MIT License 开源
    任何根据 MIT License 修改和研究的版本都必须保留本注释, 否则视为未遵守开源协议
 */
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
const starte = require("./packages/starte/index.js");
let mainWindow;
let popupWindow;
let mainpageRendererData = {};
let appTray = null;
let popupMsg;

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

function reportError(errorMsg) {
  popupMsg = errorMsg;
  popupWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    parent: mainWindow,
    modal: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    show: false
  });
  popupWindow.loadFile('src/popup.html');
  popupWindow.show();
}

async function infoToServer() {
  const errorMsg = "遥测模块出现错误。向<a href='https://zestela.co/support/' target='_blank'>此处</a>反馈<br>错误信息：";
  const userVersion = require("./package.json").version;
  const userOS = os.version().replace(/ /g, '%20') + "%20" + os.release().replace(/ /g, '%20'); //获取电脑系统版本，replace是为了把空格替换成%20，否则api链接会在空格处断开
  const getipAddress = await axios.get('https://ipapi.co/json/', { timeout: 20000 })
    .catch(function (error) {
      reportError(errorMsg + error);
    });
  const ipAddress = getipAddress.data.ip;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const getUrl = `https://api.zestela.co/info/analysis.php?getip=${ipAddress}&getuseTime=${timestamp}&getdeviceId=${require("node-machine-id").machineIdSync({ original: true })}&getuseSystem=${userOS}&getuseVersion=${userVersion}`;
  let sendInfoResult = await axios.get(getUrl, {
    timeout: 30000
  }).catch(function (error) {
    reportError(errorMsg + error);
  });
  sendInfoResult = sendInfoResult.data;
  if (sendInfoResult.code == 1) return 0;
  else reportError(errorMsg + sendInfoResult.msg);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    width: 1280,
    height: 720,
    icon: "./src/icons/dock.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
    show: false
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadFile('src/loading.html');
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

  ipcMain.handle('get-if-args', () => {
    if (typeof (pageAnchor) == "undefined") {
      return "114514";
    } else {
      return pageAnchor;
    }
  });

  ipcMain.handle('get-vici-detail', () => {
    return viciId;
  });

  ipcMain.handle('get-machine-id', () => {
    return require("node-machine-id").machineIdSync({ original: true });
  });

  ipcMain.handle('get-popup-msg', () => {
    return popupMsg;
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  if (app.isPackaged) { infoToServer(); };
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

  let mainpageData = await axios.get("https://api.zestela.co/new-mainpage/get-mainpage.php", {
    timeout: 30000
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
      let https = require('https');
      let mainpageReq = https.request(mainpageData.data.url, { method: 'HEAD' }, function (res) {
        mainpageCache.date = mainpageData.data.date;
        mainpageCache.size = JSON.parse(res.headers["content-length"]);
        fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "mainpage-cache.json"), JSON.stringify(mainpageCache));
        starte.downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
          .finally(() => {
            console.log("Log: download successfully");
            mainWindow.loadFile('src/index.html');
          });
        if (ifOpenConfig == true) starte.setWallpaper(filename);
      });
      mainpageReq.end();
    } else {
      console.log("Log: load cache successfully");
      mainWindow.loadFile('src/index.html');
    }
  } else {
    console.log("Log: there is no data of this month");
    mainWindow.loadFile('src/timeout.html');
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

ipcMain.on('pop-up-close', () => {
  popupWindow.close();
});

let shareId = 0;
let shareType = 0;
ipcMain.on('share', async (event, id, type) => {
  shareId = id;
  shareType = type;
  let shareData = await axios.get("https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
    timeout: 5000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  shareData = shareData.data;

  let https = require('https');
  let shareReq = https.request(shareData.data.url, { method: 'HEAD' }, function (res) {
    let fileSize = JSON.parse(res.headers["content-length"]);
    if (shareData.code !== 0) {
      let filename = path.join(process.env.APPDATA, "starte-cache", shareId + ".png");
      if (!fs.existsSync(filename) || (fileSize != fs.statSync(filename).size)) {
        console.log("Log: start downloading");
        starte.downloadImage(shareData.data.url, shareId + ".png")
          .finally(async () => {
            console.log("Log: download successfully");
            await mainWindow.loadFile('src/share.html');
          });
      } else {
        console.log("Log: load cache successfully");
        mainWindow.loadFile('src/share.html');
      }
    }
  });
  shareReq.end();
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
  if (filePath != undefined)
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
      await mainWindow.loadFile("src/donate.html");
      break;
    case 10:
      await mainWindow.loadFile("src/vicissitudes.html");
      break;
    case 11:
      await mainWindow.loadFile("src/search.html");
      break;
  }
});

ipcMain.on("go-to-page-with-args", async (event, page, id) => {
  pageAnchor = id;
  if (page == "wallpaper-list") {
    await mainWindow.loadFile("src/wallpaper-list.html");
  } else if (page == "sentence") {
    await mainWindow.loadFile("src/star-watching.html");
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

ipcMain.on("go-vici-detail", async (event, Id) => {
  viciId = Id;
  await mainWindow.loadFile("src/vicissitudes-detail.html");
});
