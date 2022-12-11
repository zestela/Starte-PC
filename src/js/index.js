const $ = document.querySelector.bind(document);
let mainpageData;
window.electronAPI.getMainpage()
    .then(async (resolve) => {
        resolve = JSON.parse(resolve);
        mainpageData = resolve;
        let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + mainpageData.data.id + ".png");
        document.body.style.backgroundImage = `url('${picUrl}')`;
        let time = new Date();
        $("date").innerText = time.getFullYear() + " 年 " + (time.getMonth() + 1) + " 月 " + time.getDate() + " 日";
        $(".mainpage-text-title").innerText = mainpageData.data.title;
        $(".mainpage-text-describe").innerText = mainpageData.data.describe;
    });


document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.data.id);
}, false);

document.getElementById("share").addEventListener("click", function () {
    window.electronAPI.share(mainpageData.data.id);
}, false);

window.onload = async function () {
    versionOnline = await (await fetch('https://api.discoverse.space/banben.json', { cache: 'no-cache' })).json();
    if (versionOnline.banben[0].name != await window.electronAPI.getVersion()) {
        document
            .getElementById("update-tip")
            .setAttribute("class", "update-tip-checked");
        document.getElementById("banbenhao").innerText =
            versionOnline.banben[0].name;
    }
};
