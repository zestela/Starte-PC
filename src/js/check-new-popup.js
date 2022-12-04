jQuery.ajax({
  url: "https://api.discoverse.space/banben.json",
  type: "GET",
  dataType: "json",
  cache: false,
  success: function (result) {
    jsonbanbenhaos = JSON.parse(jQuery.ajax({
      url: "./banbenhao.json",
      type: "GET",
      dataType: "json",
      async: false
    }).responseText);
    if (result.banben[0].name != jsonbanbenhaos.version) {
      document.getElementById('update-tip').setAttribute("class", "update-tip-checked");
      document.getElementById('banbenhao').innerHTML = result.banben[0].name;
    }
  }
});
