let dataLst;
let nowSelect = 0;
const $ = document.querySelector.bind(document);

window.onload = async function () {
    const data = await (await fetch("https://api.discoverse.space/mainpage/get-mainpage-history-list.php?month=08&year=2022")).json();
    dataLst = data;
    for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
        $(".wallpaper-list").insertAdjacentHTML(
        'beforeend',
        `
        <div class="wallpaper-in-list" style="background-image: url(${data.data[i].url});" id="wallpaper-${data.data[i].id}" onclick="select(${data.data[i].id})">
            <div>
                <div>
                    <h1>${data.data[i].title}</h1>
                    <h4>${data.data[i].date}</h4>
                </div>
                <h3>${data.data[i].describe}</h3>
            </div>
    </div>`);
    }
};