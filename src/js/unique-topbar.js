/**
 * 
    观星记 Starte
    Copyright (c) 2022-2023, zestela.co.
    网站: https://zestela.co/starte/
    基于 MIT License 开源
    任何根据 MIT License 修改和研究的版本都必须保留本注释, 否则视为未遵守开源协议
 */

let fileUrl = location.href.split('/');
let fileName = fileUrl[fileUrl.length - 1];

const commonTopbarFile = new Array("index.html","settings-about.html","settings.html","star-watching.html","submission.html","vicissitudes.html","wallpaper-list.html","search.html");
const loadingTopbarFile = new Array("loading.html","timeout.html");
const backTopbarFile = new Array("share.html","check-new.html","vwo50.html","vicissitudes-detail.html");
let isCommonFile = commonTopbarFile.indexOf(fileName);
let isLoadingFile = loadingTopbarFile.indexOf(fileName);
let isBackFile = backTopbarFile.indexOf(fileName);

function sendToSearch() {
  const keyword = document.getElementById("search-content").value;
   const hits = window.electronAPI.algoliaSearch(keyword);
   console.log(hits);
   const resjs = hits[0].title;
   window.electronAPI.outAlert(resjs);
}

if (isCommonFile > -1) {
	document.getElementById("topbar").insertAdjacentHTML(
        'beforeend',
        `
        <div class="topbar-menu">
        <img class="topbar-logo icon-logo"/>
        <button class="menu-item menu-item-today-img" id="today-menu" onclick="window.electronAPI.goToPage(1)">
          <img class="today-icon icon-today"/>
        </button>
        <button class="menu-item" onclick="window.electronAPI.goToPage(10)" id="vicissitudes-menu">
          <h5 class="menu-text">沧溟</h5>
        </button>
        <button class="menu-item" onclick="window.electronAPI.goToPage(2)" id="wallpaperlist-menu">
          <h5 class="menu-text">往日</h5>
        </button>
        <button class="menu-item" onclick="window.electronAPI.goToPage(6)" id="starwatching-menu">
          <h5 class="menu-text">观星</h5>
        </button>
      </div>
      <div class="topbar-icons-all">
        <div class="topbar-icons">
        <button
        class="onhover add-icon-onhover"
        onclick="window.electronAPI.goToPage(7);"
      >
      <img class="add-icon icon-add"/>
      </button>
          <button class="onhover" onclick="window.electronAPI.goToPage(11);">
            <img class="icon-search"/>
          </button>
          <button class="onhover" onclick="window.electronAPI.goToPage(3);">
            <img class="add-icon icon-settings"/>
          </button>
          <button class="onhover" onclick="window.electronAPI.windowEvents(1);">
            <img class="icon-min"/>
          </button>
          <button class="onhover" onclick="window.electronAPI.windowEvents(2);">
            <img class="icon-max"/>
          </button>
          <button
            class="onhover closeonhover"
            onclick="window.electronAPI.windowEvents(3);"
          >
          <img class="icon-close" />
          </button>
        </div>
      </div>
      `);
      if (fileName=="index.html") {
        document.getElementById("today-menu").className = "menu-item-today-img menu-item-chosen"
      } else if (fileName=="vicissitudes.html") {
        document.getElementById("vicissitudes-menu").className = "menu-item menu-item-chosen"
        document.getElementById("vicissitudes-menu").onclick = null;
      } else if (fileName=="star-watching.html") {
        document.getElementById("starwatching-menu").className = "menu-item menu-item-chosen"
        document.getElementById("starwatching-menu").onclick = null;
      } else if (fileName=="wallpaper-list.html") {
        document.getElementById("wallpaperlist-menu").className = "menu-item menu-item-chosen"
        document.getElementById("wallpaperlist-menu").onclick = null;
      } else if (fileName=="submission.html") {
        document.getElementById("sub-icon").className = "add-icon-onhover-chosen"
        document.getElementById("sub-icon").onclick = null
      }
} else if (isLoadingFile > -1) {
	document.getElementById("topbar").insertAdjacentHTML(
        'beforeend',
        `
        <div class="topbar-menu">
          <img class="topbar-logo icon-logo" />
        </div>
        <div class="topbar-icons-all">
          <div class="topbar-icons">
            <button
              class="onhover"
              onclick="window.electronAPI.windowEvents(1);"
            >
              <img class="icon-min" />
            </button>
            <button
              class="onhover"
              onclick="window.electronAPI.windowEvents(2);"
            >
              <img class="icon-max" />
            </button>
            <button
              class="onhover closeonhover"
              onclick="window.electronAPI.windowEvents(3);"
            >
            <img class="icon-close" />
            </button>
          </div>
        </div>
      `);
} else if (isBackFile > -1) {
    document.getElementById("topbar").insertAdjacentHTML(
        'beforeend',
        `
        <div class="topbar-menu">
        <img class="topbar-logo icon-logo" />
        <button class="onhover" id="back-icon" onclick="window.electronAPI.goToPage(1)">
          <img style="width: 13px; height: 13px" class="icon-back" />
        </button>
      </div>
      <div class="topbar-icons-all">
        <div class="topbar-icons">
          <button
            class="onhover add-icon-onhover"
            onclick="window.electronAPI.goToPage(7);"
          >
          <img class="add-icon icon-add"/>
          </button>
          <button class="onhover" onclick="window.electronAPI.goToPage(11);">
            <img class="icon-search"/>
          </button>
          <button class="onhover" onclick="window.electronAPI.goToPage(3);">
            <img class="add-icon icon-settings" />
          </button>
          <button class="onhover" onclick="window.electronAPI.windowEvents(1);">
            <img class="icon-min" />
          </button>
          <button class="onhover" onclick="window.electronAPI.windowEvents(2);">
            <img class="icon-max" />
          </button>
          <button
            class="onhover closeonhover"
            onclick="window.electronAPI.windowEvents(3);"
          >
          <img class="icon-close" />
          </button>
        </div>
      </div>
      `);
      if (fileName=="share.html") {
        document.getElementById("back-icon").onclick = Function("window.electronAPI.goToPage(1)");
      } else if (fileName=="vwo50.html") {
        document.getElementById("back-icon").onclick = Function("window.electronAPI.goToPage(4)");
      } else if (fileName=="check-new.html") {
        document.getElementById("back-icon").onclick = Function("window.electronAPI.goToPage(4)");
      } else if (fileName=="vicissitudes-detail.html") {
        document.getElementById("back-icon").onclick = Function("window.electronAPI.goToPage(10)");
      }
} else {
    console.log("什么玩意？")
}