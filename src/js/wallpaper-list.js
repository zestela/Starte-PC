let dataLst;
const $ = document.querySelector.bind(document);

window.onload = async function () {
    let time = new Date();
    const data = await (await fetch(`https://api.discoverse.space/new-mainpage/get-mainpage-history-list.php`)).json();
    dataLst = data;
    for (let i = Object.keys(data.data).length - 1; i >= 0; i--) {
        var photoDate=new Date(dataLst.data[i].date);
        var photoMonth=photoDate.getMonth()+1;
        var photoDay=photoDate.getDate();
        $(".wallpaper-list").insertAdjacentHTML(
        'beforeend',
        `
        <div class="wallpaper-in-list" style="background-image: url(${dataLst.data[i].url});">
            <div>
                <div>
                    <h1>${dataLst.data[i].title}</h1>
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