document.getElementById("star-list").onwheel = function (event) {
    event.preventDefault();
    this.scrollLeft += event.deltaY;
};

window.onload = async function () {
    fetch('https://api.zestela.co/new-book/get-book-sentence-list.php')
        .then(response => response.json())
        .then(async (data) => {
            dataLst = data;
            const wallpaperData = await (await fetch(`https://api.zestela.co/new-mainpage/get-mainpage-history-list.php`)).json();
            photoDate = new Date(dataLst.data[Object.keys(data.data).length - 1].date);
            photoMonth = photoDate.getMonth() + 1;
            photoDay = photoDate.getDate();
            isfromwho = "—— " + data.data[Object.keys(data.data).length - 1].from;

            for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
                let photoDate1 = new Date(dataLst.data[i].date);
                let photoMonth1 = photoDate1.getMonth() + 1;
                let photoDay1 = photoDate1.getDate();
                let fromwho = "—— " + data.data[i].from;

                document.getElementById("star-list").insertAdjacentHTML(
                    'beforeend',
                    `
        <div class="star-watching-in-list" id="${data.data[i].id}" style="background-image: url(${wallpaperData.data[i].url}),url(./icons/loading-bg.png);;">
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
                    <img class="icon-share">
                </button>
            </div>
        </div>`);
            }

            let pageAnchor;
            window.electronAPI.getIfArgs().then((result) => {
            pageAnchor = result;
            if (pageAnchor=="114514") {
                console.log("114514");
            } else {
                // 本案例默认滚动元素是　html ，你可以根据你需要的滚动元素进行设置。
                document.getElementById(pageAnchor.toString()).scrollIntoView({ behavior: 'smooth' , block: "start", inline: "start"});
            }
            });
        });


};