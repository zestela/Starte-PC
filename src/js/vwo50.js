window.onload = async function () {
    const data = await (await fetch(`https://afdian.net/api/creator/get-sponsors?user_id=77c84822f38311eb8e3052540025c377&type=new&page=1`)).json();
    const dataLst = data.data.list;
    for (let i = 0; i < dataLst.length; i++) {
        document.getElementById("vwo50-users").insertAdjacentHTML(
            'beforeend',
            `
            <div class="vwo50-user">
                <img src="${dataLst[i].avatar}">
                <div>${dataLst[i].name}</div>
            </div>
        `);
    }
};