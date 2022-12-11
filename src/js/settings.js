const $ = document.querySelector.bind(document);
window.onload = async function () {
  document.getElementById('banbenhaoinseting').innerHTML = await window.electronAPI.getVersion();
};