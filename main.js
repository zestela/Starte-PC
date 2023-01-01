require('v8-compile-cache');
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ufs = require("url-file-size");
const wallpaper = import('wallpaper');
let mainWindow;

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
  mainWindow.webContents.openDevTools();
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

  ipcMain.handle('get-setting', (configName) => {
    return JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"))).configName;
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});


async function downloadImage(url, name) {
  const writer = fs.createWriteStream(path.join(process.env.APPDATA, 'starte-cache/', name));

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}


ipcMain.on('init', async () => {
  if (!fs.existsSync(path.join(process.env.APPDATA, "starte-cache")))
    fs.mkdirSync(path.join(process.env.APPDATA, "starte-cache"));
  if (!fs.existsSync(path.join(process.env.APPDATA, "starte-cache", "config.json")))
    fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify({ infoHide: false }));
  const url = "https://api.discoverse.space/new-mainpage/get-mainpage";
  let mainpageData = await axios.get(url, {
    timeout: 30000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  mainpageData = mainpageData.data;

  if (mainpageData.code !== 0) {
    let filename = path.join(process.env.APPDATA, "starte-cache", mainpageData.data.id + ".png");
    if (!fs.existsSync(filename) || !(await ufs(mainpageData.data.url) === fs.statSync(filename).size)) {
      console.log("Log: start downloading");
      downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
        .finally(() => {
          console.log("Log: download successfully");
          mainWindow.loadFile('src/index.html');
        });
    }
    else {
      console.log("Log: load cache successfully");
      mainWindow.loadFile('src/index.html');
    }
  }
  else {
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
  }
  else if (type === 3)
    app.quit();
});

let shareId = 0;
let shareType = 0;
ipcMain.on('share', async (event, id, type) => {
  shareId = id;
  shareType = type;
  let shareData = await axios.get("https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
    timeout: 30000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  shareData = shareData.data;

  if (shareData.code !== 0) {
    let filename = path.join(process.env.APPDATA, "starte-cache", shareId + ".png");
    if (!fs.existsSync(filename) || !(await ufs(shareData.data.url) === fs.statSync(filename).size)) {
      downloadImage(shareData.data.url, shareId + ".png")
        .finally(() => {
          mainWindow.loadFile('src/share.html');
        });
    }
    else mainWindow.loadFile('src/share.html');
  }
});
ipcMain.on('set-wallpaper', async (event, id) => {
  let wallpaperData = await axios.get("https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
    timeout: 30000
  })
    .catch(function (error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  wallpaperData = wallpaperData.data;

  if (wallpaperData.code !== 0) {
    let filename = path.join(process.env.APPDATA, "starte-cache", id + ".png");
    if (!fs.existsSync(filename) || !(await ufs(wallpaperData.data.url) === fs.statSync(filename).size)) {
      downloadImage(wallpaperData.data.url, id + ".png")
        .finally(async () => {
          (await wallpaper).setWallpaper(path.join(process.env.APPDATA, "starte-cache/", id + ".png"));
        });
    }
    else (await wallpaper).setWallpaper(path.join(process.env.APPDATA, "starte-cache/", id + ".png"));
  }
});

ipcMain.on('save-share', async (event, data) => {
  try {
    let dataBuffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    fs.writeFileSync(dialog.showSaveDialogSync({
      filters: [{
        name: 'img',
        extensions: ['jpeg']
      }]
    }), dataBuffer);
  }
  catch { }
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
  }
});

// 用浏览器打开链接
app.on('web-contents-created', (e, webContents) => {
  webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

ipcMain.on("out-alert", async (event, str) => {
  var options = {
    type: 'warning',
    buttons: ["确定"],
    defaultId: 0,
    cancelId: 0,
    detail: str,
    message: ''
  };
  dialog.showMessageBoxSync(null, options);
});

ipcMain.on("set-setting", async (event, configName, value) => {
  console.log(configName,value);
  const config = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
  config.configName = value;
  fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"),JSON.stringify(config));
});