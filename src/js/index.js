let mainpageData;

document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.id);
}, false);

document.getElementById("share").addEventListener("click", function () {
    document.getElementById("share").disabled = true;
    window.electronAPI.share(mainpageData.id);
}, false);

const mainpageText = document.getElementById("mainpage-text");
const mainpageInfo = document.getElementById("mainpage-text-info");
let mainpageDisappearClass = document.getElementById("mainpage-text-disappear").className;
let mainpageDisappearImg = document.getElementById("disaImg");

async function isDisappeard() {
    mainpageText.className = "mainpage-text-disappered";
    mainpageInfo.className = "mainpage-text-disappered";
    mainpageDisappearClass = "mainpage-text-show";
    mainpageDisappearImg.setAttribute("src", "./icons/expanded.svg");
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

window.onload = async function () {
    mainpageData = await window.electronAPI.getMainpageData();
    let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + mainpageData.id + ".png");
    document.body.style.backgroundImage = `url('${picUrl}')`;
    let date = mainpageData.date;
    date = date.split("-");
    document.getElementById("date").innerText = date[0] + " 年 " + date[1] + " 月 " + date[2] + " 日";
    document.getElementById("mainpage-text-title").innerText = mainpageData.title;
    document.getElementById("mainpage-text-describe").innerText = mainpageData.describe;

    if (await window.electronAPI.getSetting('infoHide') == true) isDisappeard();
};

window.requestIdleCallback(() => {
    fetch('https://api.zestela.co/banben.json', { cache: 'no-cache' })
    .then(response => response.json())
    .then(async (versionOnline) => {
        if (versionOnline.banben[0].name != await window.electronAPI.getVersion()) {
            document
                .getElementById("update-tip")
                .setAttribute("class", "update-tip-checked");
            document.getElementById("banbenhao").innerText =
                versionOnline.banben[0].name;
        }
    });
});