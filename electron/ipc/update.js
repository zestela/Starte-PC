const { ipcMain, dialog, app } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;

function setMainWindow(window) {
  mainWindow = window;
}

function sendUpdateStatus(status) {
  console.log('Sending update status:', status);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', status);
    console.log('Status sent successfully');
  } else {
    console.error('mainWindow is null, cannot send status');
  }
}

function register() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  
  autoUpdater.forceDevUpdateConfig = true;
  
  const updateConfigPath = path.join(app.getAppPath(), 'dev-app-update.yml');
  autoUpdater.updateConfigPath = updateConfigPath;

  console.log('AutoUpdater config:', {
    forceDevUpdateConfig: autoUpdater.forceDevUpdateConfig,
    updateConfigPath: autoUpdater.updateConfigPath,
    autoDownload: autoUpdater.autoDownload,
    appPath: app.getAppPath()
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    sendUpdateStatus({
      type: 'update-available',
      version: info.version,
      releaseDate: info.releaseDate,
      notes: info.notes
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available');
    sendUpdateStatus({ type: 'update-not-available' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({
      type: 'download-progress',
      percent: Math.round(progress.percent),
      speed: progress.bytesPerSecond,
      downloaded: progress.transferred,
      total: progress.total
    });
  });

  autoUpdater.on('update-downloaded', () => {
    sendUpdateStatus({ type: 'update-downloaded' });

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '更新完成',
      message: '更新已下载完成，是否立即安装？',
      buttons: ['是', '稍后'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('AutoUpdater error:', error);
    let errorMessage = '更新失败';
    let errorCode = 'unknown';

    if (error.code) {
      errorCode = error.code;
      switch (error.code) {
        case 'ENOENT':
          errorMessage = '未找到更新文件';
          break;
        case 'ENOTFOUND':
          errorMessage = '无法连接到更新服务器';
          break;
        case 'ERR_INVALID_CHECKSUM':
          errorMessage = '文件校验失败，请重试';
          break;
        default:
          errorMessage = error.message || '更新失败';
      }
    } else {
      errorMessage = error.message || '更新失败';
    }

    sendUpdateStatus({
      type: 'update-error',
      message: errorMessage,
      code: errorCode
    });
  });

  ipcMain.handle('check-update', async () => {
    return new Promise((resolve) => {
      let timeout = setTimeout(() => {
        sendUpdateStatus({ type: 'update-error', message: '检查超时，请重试', code: 'timeout' });
        resolve({ success: false, error: '检查超时' });
      }, 15000);

      const handleAvailable = (info) => {
        clearTimeout(timeout);
        autoUpdater.removeListener('update-not-available', handleNotAvailable);
        autoUpdater.removeListener('error', handleError);
        resolve({ success: true });
      };

      const handleNotAvailable = () => {
        clearTimeout(timeout);
        autoUpdater.removeListener('update-available', handleAvailable);
        autoUpdater.removeListener('error', handleError);
        resolve({ success: true });
      };

      const handleError = (error) => {
        clearTimeout(timeout);
        autoUpdater.removeListener('update-available', handleAvailable);
        autoUpdater.removeListener('update-not-available', handleNotAvailable);
        resolve({ success: false, error: error.message });
      };

      autoUpdater.once('update-available', handleAvailable);
      autoUpdater.once('update-not-available', handleNotAvailable);
      autoUpdater.once('error', handleError);

      autoUpdater.checkForUpdates().catch((err) => {
        clearTimeout(timeout);
        resolve({ success: false, error: err.message });
      });
    });
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
    return { success: true };
  });
}

module.exports = { register, setMainWindow };
