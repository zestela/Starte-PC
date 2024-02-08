const fs = require("fs");
const path = require("path");
const axios = require('axios');
const process = require("process");
const ufs = require("../url-file-size/index.js");
const { exec } = require('child_process');

function setWallpaper(url) {
    if (process.platform == "win32") {
        const script = `
$code = @'
using System.Runtime.InteropServices;
namespace Win32{
public class Wallpaper {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    static extern int SystemParametersInfo (int uAction , int uParam , string lpvParam , int fuWinIni) ;
        public static void SetWallpaper(string thePath) {
            SystemParametersInfo(20,0,thePath,3);
        }
    }
}
'@
add-type $code
[Win32.Wallpaper]::SetWallpaper("${path.normalize(url)}")
        `;
        const scriptPath = path.join(process.env.APPDATA, "starte-cache", "wallpaper.ps1");
        fs.writeFile(scriptPath, script, () => {
            exec(`powershell ${scriptPath}`,() => { fs.rm(scriptPath, () => { }); });
        });
    }
}

module.exports.setWallpaper = setWallpaper;

module.exports.setWallPaperOut = async function (id) {
    let wallpaperData = await axios.get("https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=" + id, {
        timeout: 30000
    })
        .catch(function (error) {
            console.log('Error', error.message);
            mainWindow.loadFile('src/timeout.html');
        });
    wallpaperData = wallpaperData.data;

    if (wallpaperData.code == 1) {
        let filename = path.join(process.env.APPDATA, "starte-cache", id + ".png");
        if (!fs.existsSync(filename) || !(await ufs(wallpaperData.data.url) === fs.statSync(filename).size)) {
            downloadImage(wallpaperData.data.url, id + ".png")
                .finally(() => {
                    setWallpaper(path.join(process.env.APPDATA, "starte-cache", id + ".png"));
                });
        } else setWallpaper(path.join(process.env.APPDATA, "starte-cache", id + ".png"));
    }
};

async function downloadImage (url, name) {
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