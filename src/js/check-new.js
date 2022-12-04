
jsonbanbens = $.ajax({
  url: "https://api.discoverse.space/banben.json",
  type: "GET",
  dataType: "json",
  async: false,
  cache:false,
  success: function(data) {
  }
});
jsonbanbened=jsonbanbens.responseText;
var obj = JSON.parse(jsonbanbened);

jsonbanbenhaos = $.ajax({
  url: "./banbenhao.json",
  type: "GET",
  dataType: "json",
  async: false,
  cache:false,
  success: function(data) {
  }
});
jsonbanbenhaonow=jsonbanbenhaos.responseText;
var banbenhow = JSON.parse(jsonbanbenhaonow);
var seebanben = banbenhow.version;

var newbanbenname = obj.banben[0].name;
var newbanbenlink = obj.banben[0].url;
var newbanbenupdateweb = obj.banben[0].updateweb;
var newbanbendate = "发布时间：" + obj.banben[0].date;

function checknew() {
  if (newbanbenname != seebanben) {
    document.getElementById("new-banben").setAttribute("class", "new-banben-checked");
    document.getElementById('check-new-title').innerHTML="发现新版本";
    document.getElementById('check-new-title-name').innerHTML=newbanbenname;
    document.getElementById('check-new-describe').innerHTML=newbanbendate;
    document.getElementById('rizhi-link-text').href=newbanbenupdateweb;
    var clipboard = new ClipboardJS('.get-new', {
        text: function () {
          return newbanbenlink;
        },
      });
    clipboard.on('success', function (e) {
      document.getElementById('link-text').innerHTML="复制成功";
    });
    clipboard.on('error', function (e) {
      document.getElementById('link-text').innerHTML="复制失败";
    });
  }
}
checknew();

function checknewbutton() {
    if (newbanbenname != seebanben) {
      checknew();
    }
    else {
        document.getElementById('check-new-title').innerHTML="你使用的是最新版本";
    };
}