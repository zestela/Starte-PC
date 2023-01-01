const $ = document.querySelector.bind(document);
window.onload = async function () {
    const shareId = await window.electronAPI.getId();
    const shareType = await window.electronAPI.getShareType();
    if (shareType == 1) {
        const sentenceData = await (await fetch('https://api.discoverse.space/new-book/get-book-sentence-list.php')).json();
        let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + shareId + ".png");
        $(".share-text-title").innerText = sentenceData.data[shareId - 1].sentence;
        $(".share-text-describe").innerText = sentenceData.data[shareId - 1].from;
        $("#mainPicture").setAttribute("src", picUrl);
    }
    else {
        const wallpaperData = await (await fetch(`https://api.discoverse.space/new-mainpage/get-photo-title-describe-links.php?id=` + shareId)).json();
        let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + shareId + ".png");
        $(".share-text-title").innerText = wallpaperData.data.title;
        $(".share-text-describe").innerText = wallpaperData.data.describe;
        $("#mainPicture").setAttribute("src", picUrl);
    }
    await html2canvas(document.getElementById("share"), { scale: 4 })
        .then(async function (canvas) {
            canvas = canvas.toDataURL("image/jpeg", 1);
            await window.electronAPI.saveShare(canvas);
        });
};
