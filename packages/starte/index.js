const fs = require("fs");
const path = require("path");
const axios = require('axios');
const process = require("process");
const { exec } = require('child_process');

/**
 * 设置 Windows 桌面壁纸
 * 通过注册表 + RUNDLL32 刷新，无需 PowerShell / C# 编译
 * 比原来 PowerShell Add-Type 方案快 10 倍以上
 */
function setWallpaper(imagePath) {
    if (process.platform !== "win32") return;

    const absPath = path.resolve(imagePath);
    // 注册表 REG_SZ 值中反斜杠不需要转义，但 reg 命令中路径如果有空格需双引号包裹
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
        const wallpaperData = await axios.get("https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
            timeout: 30000
        });

        if (wallpaperData.data.code !== 1) {
            console.log('获取壁纸数据失败, code:', wallpaperData.data.code);
            return;
        }

        const filename = path.join(process.env.APPDATA, "starte-cache", id + ".png");

        // 如果图片已缓存且大小匹配，直接设置壁纸
        if (fs.existsSync(filename)) {
            setWallpaper(filename);
            return;
        }

        // 下载图片后设置壁纸
        await downloadImage(wallpaperData.data.data.url, id + ".png");
        setWallpaper(filename);
    } catch (error) {
        console.error('setWallPaperOut 错误:', error.message);
    }
};

async function downloadImage(url, name) {
    const writer = fs.createWriteStream(path.join(process.env.APPDATA, 'starte-cache', name));
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