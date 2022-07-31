let mainpageData;
window.electronAPI.getMainpage()
    .then(async (resolve) => {
        resolve = JSON.parse(resolve);
        mainpageData = resolve;
        let picUrl = (await window.electronAPI.getcwd() + "/cache/" + mainpageData.data.id + ".png");
        document.body.style.backgroundImage = `url('${picUrl}')`;
        let time = new Date().toLocaleString().split(" ")[0];
        document.getElementsByTagName("year")[0].innerText = time.split("/")[0] + " 年";
        document.getElementsByTagName("date")[0].innerText = time.split("/")[1] + " 月 " + time.split("/")[2] + " 日";
        document.getElementsByClassName("mainpage-text-title")[0].innerText = mainpageData.data.title;
        document.getElementsByClassName("mainpage-text-describe")[0].innerText = mainpageData.data.describe;
    });


document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.data.id);
}, false);

document.getElementById("share").addEventListener("click", function () {
    window.electronAPI.share(mainpageData.data.id);
}, false);