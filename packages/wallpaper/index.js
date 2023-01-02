const fs = require("fs");
const path = require("path");
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
        execSync(`powershell ${ scriptPath }`);
        fs.rmSync(scriptPath);
    }
};