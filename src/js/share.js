let shareData;
const $ = document.querySelector.bind(document);
window.electronAPI.getMainpage()
    .then(async (resolve) => {
        resolve = JSON.parse(resolve);
        shareData = resolve;
        let picUrl = (await window.electronAPI.getcwd() + "/cache/" + shareData.data.id + ".png");
        $(".share-text-title").innerText = shareData.data.title;
        $(".share-text-describe").innerText = shareData.data.describe;
        $("#mainPicture").setAttribute("src", picUrl);
        await html2canvas(document.getElementById("share"), { scale: 4 })
            .then(async function (canvas) {
                canvas = canvas.toDataURL("image/jpeg", 1);
                await window.electronAPI.saveShare(canvas);
            });
    });


