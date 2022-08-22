jsonbanbens = jQuery.ajax({
    url: "https://api.discoverse.space/banben.json",
    type: "GET",
    dataType: "json",
    async: false,
    cache:false,
    success: function(data) {
    }
  });
jsonbanbened=jsonbanbens.responseText;
var banbenlist =jQuery.parseJSON(jsonbanbened);
var obj = JSON.parse(jsonbanbened);
var newbanbenname = obj.banben[0].name;
jsonbanbenhaos = jQuery.ajax({
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
var seebanben = banbenhow.banbenhaothis[0].edition;
function disappeared() {
    document.getElementById('update-tip').setAttribute("class", "update-tip");
}
if (newbanbenname != seebanben) {
    document.getElementById('update-tip').setAttribute("class", "update-tip-checked");
    document.getElementById('banbenhao').innerHTML=newbanbenname;
    setTimeout(disappeared, 10000);
}