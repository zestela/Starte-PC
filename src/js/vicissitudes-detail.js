window.onload = function () {
    let viciId;
    window.electronAPI.getViciDetail().then((result) => {
        viciId = result;
        let url = 'https://api.discoverse.space/vicissitudes/get-vici-by-id.php?id='+viciId;
        let articleLst;
        fetch(url)
        .then(response => response.json())
        .then(data => {
            articleLst = data.data;
            let articleDate = new Date(articleLst.date);
            let articleMonth = articleDate.getMonth() + 1;
            document.getElementById('title').innerHTML = articleLst.title;
            document.getElementById('detail').innerHTML = articleLst.author + " / " + articleDate.getFullYear()+" 年 "+articleMonth+" 月 "+articleDate.getDate()+" 日 / " +articleLst.category;
            document.getElementById('content').innerHTML = articleLst.content;
        })
    })
}

