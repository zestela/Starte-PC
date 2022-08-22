const $ = document.querySelector.bind(document);

jsonbanbenhaos = jQuery.ajax({
    url: "./banbenhao.json",
    type: "GET",
    dataType: "json",
    cache:false,
    async: false,
    success: function(data) {
    }
  });
jsonbanbenhaonow=jsonbanbenhaos.responseText;
var banbenhow = JSON.parse(jsonbanbenhaonow);
var seebanben = banbenhow.banbenhaothis[0].edition;
document.getElementById('banbenhaoinseting').innerHTML=seebanben;