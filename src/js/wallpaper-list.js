let dataLst;

window.onload = async function () {
    const data = await (await fetch(`https://api.discoverse.space/new-mainpage/get-mainpage-history-list.php`)).json();
    dataLst = data;
    for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
        var photoDate = new Date(dataLst.data[i].date);
        var photoMonth = photoDate.getMonth() + 1;
        var photoDay = photoDate.getDate();
        document.querySelector(".wallpaper-list").insertAdjacentHTML(
            'beforeend',
            `
        <div class="wallpaper-in-list" style="background-image: url(${dataLst.data[i].url});">
            <div>
                <div>
                <div class="title-and-icons">
                    <h1>${dataLst.data[i].title}</h1>
                    <div class="image-action-icons">
                        <button class="onhover special-onhover" id="setWallpaper" style="padding: 3.5px 3.5px 3.5px 3.5px" onclick="window.electronAPI.setWallpaper(${dataLst.data[i].id})">
                        <img src="./icons/setWallpaper.svg">
                        </button>
                        <button class="onhover special-onhover" id="share" style="padding: 3.5px 3.5px 3.5px 3.5px" onclick="window.electronAPI.share(${dataLst.data[i].id})">
                        <img src="./icons/share.svg">
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
};