const { app, BrowserWindow, Menu, ipcMain, Notification, dialog } = require('electron');
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
    icon: "./src/icons/dock.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false
  });
  Menu.setApplicationMenu(null);
  await mainWindow.loadFile('src/loading.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(async() => {
  ipcMain.handle('load-mainpage', async () => {
    const json = await axios.get('https://api.discoverse.space/mainpage/get-mainpage');
    return JSON.stringify(json.data);
  });

  ipcMain.handle('get-cwd', () => {
    return process.cwd().replaceAll("\\", "/");
  });

  // ipcMain.handle('get-settings', () => {
  //
  // });

  await createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

async function downloadImage(url, name) {
    const writer = fs.createWriteStream(path.join(process.cwd(), "cache/", name));

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
  if (!fs.existsSync(path.join(process.cwd(), "cache")))
    fs.mkdirSync(path.join(process.cwd(), "cache"));
  let mainpageData = await axios.get('https://api.discoverse.space/mainpage/get-mainpage');
  mainpageData = mainpageData.data;
  if (mainpageData.code !== "0") {
    let filename = path.join(process.cwd(), "cache", mainpageData.data.id + ".png");
    if (!fs.existsSync(filename)) {
      console.log("Log: 开始下载(文件不存在)");
      downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
        .finally(() => {
          console.log("Log: 下载完毕");
          mainWindow.loadFile('src/index.html');
        });
    }
    else {
      if (await ufs(mainpageData.data.url) === fs.statSync(filename).size) {
        console.log("Log: 缓存加载成功");
        await mainWindow.loadFile('src/index.html');
      }
      else {
        console.log("Log: 开始下载(文件大小不符)");
        downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
          .finally(() => {
            console.log("Log: 下载完毕");
            mainWindow.loadFile('src/index.html');
          });
      }
    }
  }
  else {
    new Notification({ title: "Something is Wrong:(", body: mainpageData.msg + "因此退出了程序。将此问题反馈给我们也许会得到解决。" }).show();
    app.quit();
  }
});


ipcMain.on('set-wallpaper', async (event, id) => {
  await wallpaper.set(path.join(process.cwd(), "cache/", id + ".png"));
});

ipcMain.on('window-events', async (event, type) => {
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
  await mainWindow.loadFile("src/share.html");
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
  await mainWindow.loadFile("src/index.html");
});

ipcMain.on("go-to-past-day",async () => {
  await mainWindow.loadFile("src/wallpaper-list.html");
});

ipcMain.on("go-to-settings",async () => {
  await mainWindow.loadFile("src/settings.html");
});

ipcMain.on("go-to-about",async () => {
  await mainWindow.loadFile("src/settings-about.html");
});

ipcMain.on("go-to-gx",async () => {
  await mainWindow.loadFile("src/star-watching.html");
});

ipcMain.on("go-to-mx",async () => {
  await mainWindow.loadFile("src/pluto-staying.html");
});

// Part of Settings

// ipcMain.on('set-settings', async (event,settings) => {
//
// });



