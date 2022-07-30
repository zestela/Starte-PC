const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
// const rootCas = require('ssl-root-cas').create();
const ufs = require("url-file-size");
const wallpaper = import("wallpaper");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// rootCas.addFile(path.resolve(__dirname, 'api-discoverse-space.pem'));
// require("https").globalAgent.options.ca = rootCas;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1366,
    minHeight: 768,
    icon:"./src/icons/favicon.ico",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadFile('src/loading.html');
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  ipcMain.handle('load-mainpage', async () => {
    const json = await axios.get('https://api.discoverse.space/mainpage/get-mainpage');
    return JSON.stringify(json.data);
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
  const writer = fs.createWriteStream(path.resolve(process.cwd(), "cache", name));

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
  try {
    fs.accessSync(path.resolve(process.cwd(), "cache"), fs.F_OK);
  } catch (e) {
    fs.mkdirSync(path.resolve(process.cwd(), "cache"));
  }
  let mainpageData = await axios.get('https://api.discoverse.space/mainpage/get-mainpage');
  mainpageData = mainpageData.data;
  let filename = path.resolve(process.cwd(), "cache", mainpageData.data.id + ".png");
  if (!fs.existsSync(filename)) {
    downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
      .then(() => {
        mainWindow.loadFile('src/index.html');
      });
  }
  else {
    if (await ufs(mainpageData.data.url) == fs.statSync(filename).size) {
      mainWindow.loadFile('src/index.html');
    }
    else {
      downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
        .then(() => {
          mainWindow.loadFile('src/index.html');
        });
    }
  }
});


ipcMain.on('set-wallpaper', async (event, id) => {
  await (await wallpaper).setWallpaper(path.resolve(process.cwd(), "cache/", id + ".png"));
});