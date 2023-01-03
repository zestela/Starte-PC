let newbanbenname, newbanbenlink, newbanbenupdateweb, newbanbendate, seebanben;
window.electronAPI.getVersion().then((result) => {
  seebanben = result;
});


window.onload = async function () {
  let obj = await (await fetch('https://api.discoverse.space/banben.json', { cache: 'no-cache' })).json();
  newbanbenname = obj.banben[0].name;
  newbanbenlink = obj.banben[0].url;
  newbanbenupdateweb = obj.banben[0].updateweb;
  newbanbendate = "发布时间：" + obj.banben[0].date;
};

function checknew() {
  if (newbanbenname != seebanben) {
    document.getElementById("new-banben").setAttribute("class", "new-banben-checked");
    document.getElementById('check-new-title').innerHTML = "发现新版本";
    document.getElementById('check-new-title-name').innerHTML = newbanbenname;
    document.getElementById('check-new-describe').innerHTML = newbanbendate;
    document.getElementById('rizhi-link-text').href = newbanbenupdateweb;
  }
}
checknew();

function copyLink() {
  navigator.clipboard.writeText(newbanbenlink).then(function () {
    document.getElementById('link-text').innerHTML = "复制成功";
  }, function () {
    document.getElementById('link-text').innerHTML = "复制失败";
  });
}

function checknewbutton() {
  if (newbanbenname != seebanben) checknew();
  else document.getElementById('check-new-title').innerHTML = "你使用的是最新版本";
}