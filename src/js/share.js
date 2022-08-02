let shareData;
window.electronAPI.getMainpage()
    .then(async (resolve) => {
        resolve = JSON.parse(resolve);
        shareData = resolve;
        let picUrl = (await window.electronAPI.getcwd() + "/cache/" + shareData.data.id + ".png");
        document.getElementById("mainPicture").setAttribute("src",picUrl);
        document.getElementsByClassName("share-text-title")[0].innerText = shareData.data.title;
        document.getElementsByClassName("share-text-describe")[0].innerText = shareData.data.describe;
        // let time = new Date().toLocaleString().split(" ")[0];
        // document.getElementsByTagName("date")[0].innerText = time.split("/")[1] + " 月 " + time.split("/")[2] + " 日";
        await html2canvas(document.getElementById("share"),{scale: 4})
        .then(async function(canvas) {
            canvas = canvas.toDataURL("image/jpeg", 1);
            await window.electronAPI.saveShare(canvas);
        });
    });

    
