window.onload = async function () {
    if (await window.electronAPI.getSetting('isSelfopen') == true) {
        toggleButton.className = "button-label labelClicked";
        togglecircle.className = "circle circleClicked circle-not-click";
    };
};

const toggleButton = document.getElementById("toggle-button");
const togglecircle = document.getElementById("circle");

async function ischeck() {
    if (toggleButton.className == "button-label") {
        await window.electronAPI.setSetting("isSelfopen", true);
        toggleButton.className = "button-label labelClicked";
        togglecircle.className = "circle circleClicked";
    } else if(toggleButton.className == "button-label labelClicked") {
        await window.electronAPI.setSetting("isSelfopen", false);
        toggleButton.className = "button-label";
        togglecircle.className = "circle";
    }
}