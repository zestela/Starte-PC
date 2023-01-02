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
const axios = require('axios');
const ufs = require("./packages/url-file-size/index.js");
const wallpaper = import("./packages/wallpaper/index.js");
let mainWindow;
var appTray = null; //系统托盘菜单

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
  // mainWindow.webContents.openDevTools();

  //以下全部都是系统托盘菜单
    //设置托盘图标和菜单
    var trayMenuTemplate = [{
        label: '打开主界面',
        icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toHome.png")),
        click: function() {
          mainWindow.loadFile("src/index.html");
          mainWindow.show();
        } //打开相应页面
      },
      {
        label: '投稿',
        icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toSUb.png")),
        click: function() {
          mainWindow.loadFile("src/submission.html");
          mainWindow.show();
        } //打开相应页面
      },
      {
        label: '退出观星记',
        icon: nativeImage.createFromPath(path.join(__dirname, "src/icons/toExit.png")),
        click: function() {
          const config = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
          config.infoHide = false;
          fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify(config));
          app.quit();
          app.quit(); //因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
        }
      }
    ];
    //系统托盘图标
    appTray = new Tray(nativeImage.createFromPath(path.join(__dirname, "src/icons/dock.ico")));
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('观星记 Starte');
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);
    //单击右下角小图标显示应用左键
    appTray.on('click', function() {
      mainWindow.show();
    })
    //右键
    appTray.on('right-click', () => {
      appTray.popUpContextMenu(trayMenuTemplate);
    });
 //以上全部都是系统托盘菜单
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

  ipcMain.handle('get-setting', (event, configName) => {
    const jsonValue = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
    return jsonValue[configName];
  });

  createWindow();

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

//以下全部都是单独出来的设置壁纸函数
async function setWallPaperOut(id) {
  let wallpaperData = await axios.get("https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
      timeout: 30000
    })
    .catch(function(error) {
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
    } else(await wallpaper).setWallpaper(path.join(process.env.APPDATA, "starte-cache/", id + ".png"));
  }
}
//以上全部都是单独出来的设置壁纸函数

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
    fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify({
      infoHide: false
    }));
  const url = "https://api.discoverse.space/new-mainpage/get-mainpage";
  let mainpageData = await axios.get(url, {
      timeout: 30000
    })
    .catch(function(error) {
      console.log('Error', error.message);
      mainWindow.loadFile('src/timeout.html');
    });
  mainpageData = mainpageData.data;
  const ifOpenConfig = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"))).isSelfopen;


  if (mainpageData.code !== 0) {
    let filename = path.join(process.env.APPDATA, "starte-cache", mainpageData.data.id + ".png");
    if (!fs.existsSync(filename) || !(await ufs(mainpageData.data.url) === fs.statSync(filename).size)) {
      console.log("Log: start downloading");
      downloadImage(mainpageData.data.url, mainpageData.data.id + ".png")
        .finally(() => {
          console.log("Log: download successfully");
          mainWindow.loadFile('src/index.html');
        });
      if (ifOpenConfig == true) {
        setWallPaperOut(mainpageData.data.id);
      } //如果开机自启则自动设置壁纸

    } else {
      console.log("Log: load cache successfully");
      mainWindow.loadFile('src/index.html');
      if (ifOpenConfig == true) {
        setWallPaperOut(mainpageData.data.id);
      } //如果开机自启则自动设置壁纸
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
  } else if (type === 3) {
    mainWindow.hide(); //关闭按钮隐藏而非退出
  }
});

let shareId = 0;
let shareType = 0;
ipcMain.on('share', async (event, id, type) => {
  shareId = id;
  shareType = type;
  let shareData = await axios.get("https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
      timeout: 30000
    })
    .catch(function(error) {
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
    } else mainWindow.loadFile('src/share.html');
  }
});

ipcMain.on('set-wallpaper', async (event, id) => {
  setWallPaperOut(id); //使用上文的函数
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
  } catch {}
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
  console.log(configName, value);
  const config = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
  config[configName] = value;
  fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify(config));
  //以下设置开机自启动
  const ifOpenConfig = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"))).isSelfopen;
  if (ifOpenConfig == true) {
    // 开机自启动
    try {
      const exeName = path.basename(process.execPath)
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: process.execPath,
        args: [
          '--processStart', `"${exeName}"`,
        ]
      })
      console.log("ifOpenConfig==true")
    } catch (err) {
      console.log("err")
    }
  } else if (ifOpenConfig == false) {
    try {
      app.setLoginItemSettings({
        openAtLogin: false
      })
    } catch (err) {
      console.log("err")
    }
    console.log("ifOpenConfig==false")
  }
  //设置开机自启动
});