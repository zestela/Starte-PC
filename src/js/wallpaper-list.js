let dataLst;
const $ = document.querySelector.bind(document);

window.onload = async function () {
    let time = new Date();
    const data = await (await fetch(`https://api.discoverse.space/mainpage/get-mainpage-history-list.php?month=${(time.getMonth() + 1) < 10 ? '0'  + (time.getMonth() + 1): (time.getMonth() + 1)}&year=${time.getFullYear()}`)).json();
    dataLst = data;
    for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
        $(".wallpaper-list").insertAdjacentHTML(
        'beforeend',
        `
        <div class="wallpaper-in-list" style="background-image: url(${dataLst.data[i].url});">
            <div>
                <div>
                    <h1>${dataLst.data[i].title}</h1>
                    <h4>${dataLst.data[i].date}</h4>
                </div>
                <h3>${dataLst.data[i].describe}</h3>
            </div>
    </div>`);
    }
};