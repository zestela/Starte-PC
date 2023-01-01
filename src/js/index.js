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

const mainpageText = document.getElementById("mainpage-text");
const mainpageInfo = document.getElementById("mainpage-text-info");
let mainpageDisappearClass = document.getElementById("mainpage-text-disappear").className;
let mainpageDisappearImg = document.getElementById("disaImg");

function textDisplayNone() {
    mainpageText.className = "mainpage-text-disappered";
    mainpageInfo.className = "mainpage-text-disappered";
};

function textDisappeaed() {
    if (mainpageDisappearClass=="mainpage-text-disappear") {
        mainpageText.className = "mainpage-text mainpage-text-disappering";
        mainpageInfo.className = "mainpage-text-info mainpage-text-disappering";
        setTimeout("textDisplayNone()", 1000);
        mainpageDisappearClass = "mainpage-text-show";
        mainpageDisappearImg.setAttribute("src", "./icons/expanded.svg");
    } else {
        mainpageText.className = "mainpage-text-showed mainpage-text mainpage-text-showing";
        mainpageInfo.className = "mainpage-text-showed mainpage-text-info mainpage-text-showing";
        mainpageDisappearClass = "mainpage-text-disappear";
        mainpageDisappearImg.setAttribute("src", "./icons/expand.svg");
    }
};