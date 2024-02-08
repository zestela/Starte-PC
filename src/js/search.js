window.onload = async function () {
    let mainpageData = await window.electronAPI.getMainpageData();
    let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + mainpageData.id + ".png");
    document.getElementById("search-box-container").style.backgroundImage = `url('${picUrl}')`;
};

const client = algoliasearch('PLIM4BWFMR', '493296b2dd9b5d8709021dc22375cdc5');
const index = client.initIndex('startePhotoDatabase');
const sentenceIndex = client.initIndex('starteSentenceDatabase');
document.getElementById("search-input").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search-button").click();
    }
});

function searchAlgolia() {
    const searchKeyword = document.getElementById("search-input").value;
    if (searchKeyword == null || searchKeyword == "") {
        window.electronAPI.outAlert("请输入搜索内容");
    } else {
        index.search(searchKeyword, {
            attributesToRetrieve: ['title', 'describe', 'url', 'objectID'],
        }).then(({ hits }) => {
        document.getElementById("search-box-container").className = "search-box-container-after";
        document.getElementById("search-results").className = "search-results-after";
        console.log(hits);
        document.getElementById("photos-result-title").innerHTML = "图片";
        document.getElementById("photos-results").innerHTML = null;
        if (Object.keys(hits).length-1 >= 0) {
            for (let i = Object.keys(hits).length - 1; i >= 0; i--) {
                document.getElementById("photos-results").insertAdjacentHTML('beforeend',`
                <div class="photos-result" id="photos-result" onclick="window.electronAPI.goToPageWithArgs('wallpaper-list',${hits[i].objectID})" style="background-image: url(${hits[i].url});">
                <div class="photo-texts">
                  <div class="photo-title">${hits[i].title}</div>
                  <div class="photo-describe">${hits[i].describe.substring(0,20) + "..."}</div>
                </div>
                </div>
                `);
            }
        } else {
            document.getElementById("photos-results").innerHTML = "无数据";
        } });

        sentenceIndex.search(searchKeyword, {
            attributesToRetrieve: ['sentence', 'from'],
        }).then(({ hits }) => {
            console.log(hits);
            document.getElementById("sentence-result-title").innerHTML = "句子";
            document.getElementById("sentence-results").innerHTML = null;
            if (Object.keys(hits).length-1 >= 0) {
                for (let i = Object.keys(hits).length - 1; i >= 0; i--) {
                    document.getElementById("sentence-results").insertAdjacentHTML('beforeend',`
                    <div class="sentence-texts" onclick="window.electronAPI.goToPageWithArgs('sentence',${hits[i].objectID})">
                    <div class="sentence-text">
                    <div class="photo-title">${hits[i].sentence}</div>
                    <div class="photo-describe" style="text-align: end;">${"——"+hits[i].from}</div>
                    </div>
                    </div>
                    `);
                }
            } else {
                document.getElementById("sentence-results").innerHTML = "无数据";
        } });
    }
}