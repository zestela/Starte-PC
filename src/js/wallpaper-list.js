let dataLst;

window.onload = async function () {
    fetch('https://api.zestela.co/new-mainpage/get-mainpage-history-list.php')
        .then(response => response.json())
        .then(data => {
            dataLst = data;
            for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
                let photoDate = new Date(dataLst.data[i].date);
                let photoMonth = photoDate.getMonth() + 1;
                let photoDay = photoDate.getDate();
                document.getElementById("wallpaper-list").insertAdjacentHTML(
                    'beforeend',
                    `
        <div class="wallpaper-in-list" id="${dataLst.data[i].id}" style="background-image: url(${dataLst.data[i].url}),url(./icons/loading-bg.png);">
            <div>
                <div>
                <div class="title-and-icons">
                    <h1>${dataLst.data[i].title}</h1>
                    <div class="image-action-icons">
                        <button class="onhover special-onhover" id="setWallpaper" style="padding: 3.5px 3.5px 3.5px 3.5px" onclick="window.electronAPI.setWallpaper(${dataLst.data[i].id})">
                        <img class="icon-set-wallpaper">
                        </button>
                        <button class="onhover special-onhover" id="share" style="padding: 3.5px 3.5px 3.5px 3.5px" onclick="window.electronAPI.share(${dataLst.data[i].id},0)">
                        <img class="icon-share">
                        </button>
                    </div>
                </div>
                <div class="disPLAYDATE">
                    <div class="month">${photoMonth}</div>
                    <div class="fenge"> / </div>
                    <div class="dayte">${photoDay}</div>
                </div>
                </div>
                <h3>${dataLst.data[i].describe}</h3>
            </div>
        </div>`);
            }
            let pageAnchor;
            window.electronAPI.getIfArgs().then((result) => {
            pageAnchor = result;
            if (pageAnchor=="114514") {
                console.log("114514");
            } else {
                document.getElementById(pageAnchor.toString()).scrollIntoView({ behavior: 'smooth' , block: "start", inline: "start"});
            }
            });
        });
};
 