let mainpageData;
window.electronAPI.getMainpage()
    .then((resolve) => {
        resolve = JSON.parse(resolve);
        mainpageData = resolve;
        document.getElementsByTagName("body")[0].style.backgroundImage = `url("../cache/${resolve.data.id}.png")`;
        let time = new Date().toLocaleString().split(" ")[0];
        document.getElementsByTagName("year")[0].innerText = time.split("/")[0] + " 年";
        document.getElementsByTagName("date")[0].innerText = time.split("/")[1] + " 月 " + time.split("/")[2] + " 日";
        document.getElementsByClassName("mainpage-text-title")[0].innerText = resolve.data.title;
        document.getElementsByClassName("mainpage-text-describe")[0].innerText = resolve.data.describe;
    });


document.getElementById("setWallpaper").addEventListener("click", function () {
    window.electronAPI.setWallpaper(mainpageData.data.id);
}, false);