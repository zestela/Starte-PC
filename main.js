require('v8-compile-cache');
const { app, BrowserWindow, Menu, shell, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const ufs = require("url-file-size");
const wallpaper = require("wallpaper");
https.globalAgent.options.rejectUnauthorized = false;
https.globalAgent.options.family = 4;
let mainWindow;


async function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 500,
    width: 1280,
    height: 720,
    icon: "./src/icons/dock.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadFile('src/loading.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  ipcMain.handle('load-mainpage', async () => {
    const json = await axios.get('https://api.discoverse.space/new-mainpage/get-mainpage');
    return JSON.stringify(json.data);
  });

  ipcMain.handle('get-cwd', () => {
    return process.cwd().replaceAll("\\", "/");
  });

  ipcMain.handle('get-appdata', () => {
    return process.env.APPDATA.replaceAll("\\", "/");
  });

  // ipcMain.handle('get-settings', () => {
  //
  // });

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


ipcMain.on('set-wallpaper', async (event, id) => {
  await wallpaper.set(path.join(process.env.APPDATA, "starte-cache/", id + ".png"));
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

// Part of Share
let shareId;
ipcMain.on('share', async (event, id) => {
  shareId = id;
  mainWindow.loadFile("src/share.html");
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
  catch {
  }
});

// Go to the Page

ipcMain.on('back-to-mainpage', async () => {
  mainWindow.loadFile("src/index.html");
});

ipcMain.on("go-to-past-day", async () => {
  mainWindow.loadFile("src/wallpaper-list.html");
});

ipcMain.on("go-to-settings", async () => {
  mainWindow.loadFile("src/settings.html");
});

ipcMain.on("go-to-about", async () => {
  mainWindow.loadFile("src/settings-about.html");
});

ipcMain.on("go-to-timeout", async () => {
  mainWindow.loadFile("src/timeout.html");
});

ipcMain.on("go-to-gx", async () => {
  mainWindow.loadFile("src/star-watching.html");
});

ipcMain.on("go-to-mx", async () => {
  mainWindow.loadFile("src/pluto-relaxing.html");
});

ipcMain.on("go-to-check", async () => {
  mainWindow.loadFile("src/check-new.html");
});

// Part of Settings

// ipcMain.on('set-settings', async (event,settings) => {
//
// });


// 用浏览器打开链接
app.on('web-contents-created', (e, webContents) => {
  webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

// 开机自启动
// const exeName = path.basename(process.execPath)
// app.setLoginItemSettings({
//   openAtLogin: true,
//   openAsHidden: false,
//   path: process.execPath,
//   args: [
//     '--processStart', `"${exeName}"`,
//   ]
// })