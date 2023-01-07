window.onload = async function () {
    let mainpageData = await window.electronAPI.getMainpageData();
    let picUrl = (await window.electronAPI.getappdata() + "/starte-cache/" + mainpageData.id + ".png");
    document.getElementById("top-bg-photo").style.backgroundImage = `url('${picUrl}')`;
    document.getElementById("photo-title").innerHTML = "今日 : "+mainpageData.title;
    let d = new Date();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let day = d.getDay();
    const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    document.getElementById("date").innerHTML = month+" 月 "+date+" 日";
    document.getElementById("day").innerHTML = days[day];

    fetch('https://api.discoverse.space/vicissitudes/vicissitudes.php')
        .then(response => response.json())
        .then(data => {
            articleLst = data.data;
            for (let i = Object.keys(articleLst).length-1; i >= 0; i--) {
                let articleDate = new Date(articleLst[i].date);
                let articleMonth = articleDate.getMonth() + 1;
                let todayDate = new Date();
                if (articleLst[i].ifRecm == "true") {
                    document.getElementById("left-content-rec").insertAdjacentHTML('beforeend',`
                    <div class="vicissitudes-left-card" onclick="window.electronAPI.goViciDetail(${articleLst[i].id})">
                        <div style="padding: 15px;">
                            <div class="card-title">${articleLst[i].title}</div>
                            <div class="card-describe">${articleLst[i].summary}</div>
                            <div class="card-detail">${articleLst[i].author + " / " + articleDate.getFullYear()+" 年 "+articleMonth+" 月 "+articleDate.getDate()+" 日 / " +articleLst[i].category}</div>
                        </div>
                    </div>
                    `)
                }
                if (articleLst[i].category == "小说") {
                    document.getElementById("left-content-novel").insertAdjacentHTML('beforeend',`
                    <div class="vicissitudes-left-card" onclick="window.electronAPI.goViciDetail(${articleLst[i].id})">
                        <div style="padding: 15px;">
                            <div class="card-title">${articleLst[i].title}</div>
                            <div class="card-describe">${articleLst[i].summary}</div>
                            <div class="card-detail">${articleLst[i].author + " / " + articleDate.getFullYear()+" 年 "+articleMonth+" 月 "+articleDate.getDate()+" 日 / " +articleLst[i].category}</div>
                        </div>
                    </div>
                    `)
                } else if (articleLst[i].category == "科普") {
                    document.getElementById("left-content-kepu").insertAdjacentHTML('beforeend',`
                    <div class="vicissitudes-left-card" onclick="window.electronAPI.goViciDetail(${articleLst[i].id})">
                        <div style="padding: 15px;">
                            <div class="card-title">${articleLst[i].title}</div>
                            <div class="card-describe">${articleLst[i].summary}</div>
                            <div class="card-detail">${articleLst[i].author + " / " + articleDate.getFullYear()+" 年 "+articleMonth+" 月 "+articleDate.getDate()+" 日 / " +articleLst[i].category}</div>
                        </div>
                    </div>
                    `)
                }

                let articleTime = articleDate.getTime();
                let todayTime = todayDate.getTime();
                let todayTime14dayBefore = todayTime-1296000000;
                if (articleTime<todayTime && articleTime>todayTime14dayBefore) {
                    document.getElementById("right-content").insertAdjacentHTML('beforeend',`
                    <div class="vicissitudes-left-card" onclick="window.electronAPI.goViciDetail(${articleLst[i].id})">
                        <div style="padding: 15px;">
                            <div class="card-title">${articleLst[i].title}</div>
                            <div class="card-describe">${articleLst[i].summary}</div>
                            <div class="card-detail">${articleLst[i].author + " / " + articleDate.getFullYear()+" 年 "+articleMonth+" 月 "+articleDate.getDate()+" 日 / " +articleLst[i].category}</div>
                        </div>
                    </div>
                `)
                }
            }
        })
        var liArr = document.getElementsByTagName("divv");
        var spanArr = document.getElementsByTagName("divs");
        for(var i=0;i<liArr.length;i++){
            liArr[i].index = i;
            liArr[i].onclick = function () {
                for(var j=0;j<liArr.length;j++){
                    liArr[j].className = "";
                    spanArr[j].className = "vicissitudes-left-card-notshow";
                }
                this.className = "vicissitudes-left-title-current";
                spanArr[this.index].className = "vicissitudes-left-content";
            }
        }
}

