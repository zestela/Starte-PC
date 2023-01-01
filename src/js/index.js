const $ = document.querySelector.bind(document);
let mainpageData;

document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.data.id);
}, false);

document.getElementById("share").addEventListener("click", function () {
    window.electronAPI.share(mainpageData.data.id);
}, false);

window.onload = async function () {
    mainpageData = await (await fetch('https://api.discoverse.space/new-mainpage/get-mainpage', { cache: 'no-cache' })).json();
    let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + mainpageData.data.id + ".png");
    document.body.style.backgroundImage = `url('${picUrl}')`;
    let date = mainpageData.data.date;
    date = date.split("-");
    $("date").innerText = date[0]  + " 年 " + date[1] + " 月 " + date[2] + " 日";
    $(".mainpage-text-title").innerText = mainpageData.data.title;
    $(".mainpage-text-describe").innerText = mainpageData.data.describe;

    versionOnline = await (await fetch('https://api.discoverse.space/banben.json', { cache: 'no-cache' })).json();
    if (versionOnline.banben[0].name != await window.electronAPI.getVersion()) {
        document
            .getElementById("update-tip")
            .setAttribute("class", "update-tip-checked");
        document.getElementById("banbenhao").innerText =
            versionOnline.banben[0].name;
    }
    if (await window.electronAPI.getSetting("infoHide") == true) textDisappeaed();
};

const mainpageText = document.getElementById("mainpage-text");
const mainpageInfo = document.getElementById("mainpage-text-info");
let mainpageDisappearClass = document.getElementById("mainpage-text-disappear").className;
let mainpageDisappearImg = document.getElementById("disaImg");

async function textDisplayNone() {

}

async function textDisappeaed() {
    if (mainpageDisappearClass == "mainpage-text-disappear") {
        await window.electronAPI.setSetting("infoHide", true);
        mainpageText.className = "mainpage-text mainpage-text-disappering";
        mainpageInfo.className = "mainpage-text-info mainpage-text-disappering";
        setTimeout(() => {
            mainpageText.className = "mainpage-text-disappered";
            mainpageInfo.className = "mainpage-text-disappered";
        }, 500);
        mainpageDisappearClass = "mainpage-text-show";
        mainpageDisappearImg.setAttribute("src", "./icons/expanded.svg");
    } else {
        await window.electronAPI.setSetting("infoHide", false);
        mainpageText.className = "mainpage-text-showed mainpage-text mainpage-text-showing";
        mainpageInfo.className = "mainpage-text-showed mainpage-text-info mainpage-text-showing";
        mainpageDisappearClass = "mainpage-text-disappear";
        mainpageDisappearImg.setAttribute("src", "./icons/expand.svg");
    }
}