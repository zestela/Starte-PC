const $ = document.querySelector.bind(document);

$(".star-list").onwheel = function (event) {
    event.preventDefault();
    this.scrollLeft += event.deltaY;
};

window.onload = async function () {
    let time = new Date();
    const wallpaperData = await (await fetch(`https://api.discoverse.space/mainpage/get-mainpage-history-list.php?month=${(time.getMonth() + 1) < 10 ? '0'  + (time.getMonth() + 1): (time.getMonth() + 1)}&year=${time.getFullYear()}`)).json();
    const data = await (await fetch(`https://api.discoverse.space/book/get-book-sentence-list.php?month=${(time.getMonth() + 1) < 10 ? '0'  + (time.getMonth() + 1): (time.getMonth() + 1)}&year=${time.getFullYear()}`)).json();
    const mainpageData = await (await fetch('https://api.discoverse.space/mainpage/get-mainpage')).json();
    dataLst = data;
    $(".star-list").insertAdjacentHTML(
        'beforeend',
        `
        <div class="star-watching-in-list" style="background-image: url(${mainpageData.data.url});">
            <div>
                <div>
                    <h1>${data.data[Object.keys(data.data).length - 1].sentence}</h1>
                    <h3>${data.data[Object.keys(data.data).length - 1].from}</h3>
                </div>
                <h4>${data.data[Object.keys(data.data).length - 1].date}</h4>
            </div>
    </div>`);
    for (let i = Object.keys(data.data).length - 2; i >= 0; i--) {
        $(".star-list").insertAdjacentHTML(
            'beforeend',
            `
        <div class="star-watching-in-list" style="background-image: url(${wallpaperData.data[i].url});">
            <div>
                <div>
                    <h1>${data.data[i].sentence}</h1>
                    <h3>${data.data[i].from}</h3>
                </div>
                <h4>${data.data[i].date}</h4>
            </div>
    </div>`);
    }
};