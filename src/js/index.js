const $ = document.querySelector.bind(document);
let mainpageData;
window.electronAPI.getMainpage()
    .then(async (resolve) => {
        resolve = JSON.parse(resolve);
        mainpageData = resolve;
        let picUrl = (await window.electronAPI.getcwd() + "/cache/" + mainpageData.data.id + ".png");
        document.body.style.backgroundImage = `url('${picUrl}')`;
        let time = new Date().toLocaleString().split(" ")[0];
        $("year").innerText = time.split("/")[0] + " 年";
        $("date").innerText = time.split("/")[1] + " 月 " + time.split("/")[2] + " 日";
        $(".mainpage-text-title").innerText = mainpageData.data.title;
        $(".mainpage-text-describe").innerText = mainpageData.data.describe;
    });


document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.data.id);
}, false);

document.getElementById("share").addEventListener("click", function () {
    window.electronAPI.share(mainpageData.data.id);
}, false);