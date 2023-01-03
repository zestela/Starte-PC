document.getElementById("star-list").onwheel = function (event) {
    event.preventDefault();
    this.scrollLeft += event.deltaY;
};

window.onload = async function () {
    const wallpaperData = await (await fetch(`https://api.discoverse.space/new-mainpage/get-mainpage-history-list.php`)).json();
    const data = await (await fetch(`https://api.discoverse.space/new-book/get-book-sentence-list.php`)).json();
    dataLst = data;
    photoDate = new Date(dataLst.data[Object.keys(data.data).length - 1].date);
    photoMonth = photoDate.getMonth() + 1;
    photoDay = photoDate.getDate();
    isfromwho = "—— " + data.data[Object.keys(data.data).length - 1].from;

    for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
        var photoDate1 = new Date(dataLst.data[i].date);
        var photoMonth1 = photoDate1.getMonth() + 1;
        var photoDay1 = photoDate1.getDate();
        var fromwho = "—— " + data.data[i].from;

        document.getElementById("star-list").insertAdjacentHTML(
            'beforeend',
            `
        <div class="star-watching-in-list" style="background-image: url(${wallpaperData.data[i].url});">
            <div class="texts">

                <div>
                    <h1>${data.data[i].sentence}</h1>
                    <h3>${fromwho}</h3>
                </div>


            </div>
            <div class="star-watching-bottom">
                <div class="disPLAYDATE">
                    <div class="month">${photoMonth1}</div>
                    <div class="fenge"> / </div>
                    <div class="dayte">${photoDay1}</div>
                </div>
                <button class="onhover special-onhover" id="share" style="padding: 3px 3px 3px 3px" onclick="window.electronAPI.share(${wallpaperData.data[i].id},1)">
                    <img src="./icons/share.svg">
                </button>
            </div>
    </div>`);
    }
};