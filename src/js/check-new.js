fetch('https://api.discoverse.space/banben.json')
  .then(response => response.json())
  .then(json => console.log(json))
  .catch(err => console.log('Request Failed', err)); 

var banbenlist ='{ "banben" : [' +
'{ "name":"TESTbanben" , "url":"testURL" , "date":"TESTDATE" } ]}';

var obj = JSON.parse(banbenlist);

var newbanbenname = obj.banben[0].name;

var newbanbenlink = obj.banben[0].url;


var newbanbendate = "发布时间：" + obj.banben[0].date;

function checknew() {
    if (newbanbenname != "0.0.20") {
        document.getElementById("new-banben").setAttribute("class", "new-banben-checked");
        document.getElementById('check-new-title').innerHTML="发现新版本";
        document.getElementById('check-new-title-name').innerHTML=newbanbenname;
        document.getElementById('check-new-describe').innerHTML=newbanbendate;
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
    else {
        document.getElementById('check-new-title').innerHTML="你使用的是最新版本";
    };
}