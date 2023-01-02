const fs = require("fs");
const path = require("path");
const axios = require('axios');
const process = require("process");
const { execSync } = require('child_process');

module.exports.setWallpaper = function (url) {
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
        fs.writeFileSync(scriptPath, script);
        execSync(`powershell ${scriptPath}`);
        fs.rmSync(scriptPath);
    }
};

module.exports.setWallPaperOut = async function (id) {
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
                .finally(() => {
                    wallpaper.setWallpaper(path.join(process.env.APPDATA, "starte-cache", id + ".png"));
                });
        } else wallpaper.setWallpaper(path.join(process.env.APPDATA, "starte-cache", id + ".png"));
    }
};

module.exports.downloadImage = async function (url, name) {
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
};