document.getElementById("menu-button").addEventListener("click", function () {
    if($(`.all-menu`).classList.contains("menu-focus"))
        $(`.all-menu`).classList.remove("menu-focus");
    else
        $(`.all-menu`).classList.add("menu-focus");
}, false);