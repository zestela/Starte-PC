let dataLst;
let nowSelect = 0;
window.onload = async function () {
    const data = await (await fetch("https://api.discoverse.space/mainpage/get-mainpage-history-list.php?month=08&year=2022")).json();
    dataLst = data;
    for (let i = 0; i < Object.keys(data.data).length; i++) {
        $(".wallpaper-list").append(`
        <div class="wallpaper-in-list" style="background-image: url(${data.data[i].url});" id="${data.data[i].id}" onclick="select(${data.data[i].id})">
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
function select(id) {
    if (id != 0) {
        $(`#${nowSelect}`).removeClass("focus");
        nowSelect = id;
    }
    else
        nowSelect = id;
    $(`#${id}`).addClass("focus");
}