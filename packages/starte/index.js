const fs = require("fs");
const path = require("path");
const { Readable } = require('stream');
const process = require("process");
const { exec } = require('child_process');

/**
 * 设置 Windows 桌面壁纸
 * 通过注册表 + RUNDLL32 刷新，无需 PowerShell / C# 编译
 */
function setWallpaper(imagePath) {
    if (process.platform !== "win32") return;

    const absPath = path.resolve(imagePath);
    const cmd = `reg add "HKCU\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d "${absPath}" /f && RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error('设置壁纸失败:', err.message);
            return;
        }
        console.log('壁纸设置成功:', absPath);
    });
}

module.exports.setWallpaper = setWallpaper;

module.exports.setWallPaperOut = async function (id) {
    try {
        const wallpaperData = await fetch("https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
            signal: AbortSignal.timeout(30000)
        }).then(r => r.json())
        .catch(function (error) {
            console.log('Error', error.message);
            return null;
        });

        if (!wallpaperData || wallpaperData.code !== 1) {
            console.log('获取壁纸数据失败, code:', wallpaperData?.code);
            return;
        }

        const filename = path.join(process.env.APPDATA, "starte-cache", id + ".png");

        if (fs.existsSync(filename)) {
            setWallpaper(filename);
            return;
        }

        await downloadImage(wallpaperData.data.url, id + ".png");
        setWallpaper(filename);
    } catch (error) {
        console.error('setWallPaperOut 错误:', error.message);
    }
};

async function downloadImage(url, name) {
    const writer = fs.createWriteStream(path.join(process.env.APPDATA, 'starte-cache', name));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    Readable.fromWeb(response.body).pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

module.exports.downloadImage = downloadImage;

module.exports.getSetting = async function (configName) {
    const jsonValue = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
    return jsonValue[configName];
};

module.exports.setSetting = async function (configName, value) {
    console.log(configName, value);
    const config = JSON.parse(fs.readFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json")));
    config[configName] = value;
    fs.writeFileSync(path.join(process.env.APPDATA, "starte-cache", "config.json"), JSON.stringify(config));
};
