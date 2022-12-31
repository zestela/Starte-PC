const dropArea = document.querySelector('.dropArea');
const tip = document.querySelector('.tip');
const file = document.querySelector('input[type="file"]');
function testIfPhoto(filenames) {
  if (!/\.(jpg|png|tiff|pjp|jfif|bmp|gif|svg|png|jpeg|xbm|jxl|svgz|ico|tif|pjpeg|avif)$/.test(filenames)) {
    return true;
  } else {
    return false;
  }
};
var el = document.getElementById('userDesctibe');
el.addEventListener('input', function() {
  var len = txtCount(this); //   调用函数 
  document.getElementById('textCount').innerHTML = len;
});

function txtCount(el) {
  var val = el.value;
  var eLen = val.length;
  return eLen;
}

function ignoreDrag(e) {
  e.preventDefault(); // 取消默认行为
  // e.stopPropagation();	// 阻止冒泡
}

function fileinfo() {
  file.onchange = function() {
    for (var i = 0; i < this.files.length; i++) {
      // 隐藏提示文字
      filefile = document.getElementById('file-uploader').files[0];
      const fileMaxSize = 1024 * 1024 * 5;
      fileName = document.getElementById('file-uploader').files[0].name;
      imgUrl = document.getElementById('file-uploader').files[0].path;
      if (filefile.size > fileMaxSize) {
        window.electronAPI.outAlert('图片大小不超过5M！');
      } else if (testIfPhoto(fileName)) {
        window.electronAPI.outAlert('必须上传图片格式！')
      } else {
        var img = new Image();
        img_src = window.URL.createObjectURL(this.files[i]);
        img.src = img_src;
        if (document.getElementById("compress-list-item")) {
          var wrap = document.getElementById('compress-list-item');
          dropArea.appendChild(wrap);
          var item = document.getElementById('compress-list-preview');
          item.style.backgroundImage = 'url(' + img_src + ')';
          wrap.appendChild(item);
          img.onload = function() {
            window.URL.revokeObjectURL(this.src);
          }
        } else {
          var wrap = document.createElement('div');
          wrap.className = 'compress-list-item';
          wrap.setAttribute('id', 'compress-list-item');
          dropArea.appendChild(wrap);
          // 创建背景缩略图
          var item = document.createElement('div');
          item.className = 'compress-list-preview';
          item.setAttribute('id', 'compress-list-preview');
          item.style.backgroundImage = 'url(' + img_src + ')';
          wrap.appendChild(item);
          // 若背景图加载成功，则释放 URL 实例
          img.onload = function() {
            window.URL.revokeObjectURL(this.src);
          }
        }
      };
    }
  }
}
// 事件监听i
dropArea.addEventListener('dragenter', ignoreDrag, false);
dropArea.addEventListener('dragover', ignoreDrag, false);
dropArea.addEventListener('click', function(e) {
  // file模拟input点击事件
  var evt = new MouseEvent('click', {
    bubbles: false,
    cancelable: true,
    view: window
  });
  file.dispatchEvent(evt, fileinfo());
}, false);
//发送邮件如下
function sendEmailToOfficial() {
  var UserTitle = document.getElementById("userTitle").value;
  var UserDescribe = document.getElementById("userDesctibe").value;
  var UserName = document.getElementById("userName").value;
  var UserEmail = document.getElementById("userEmail").value;
  var UserCopyright = document.getElementById("userCopyright").value;
  var sendMessage = "标题：" + UserTitle + "，描述：" + UserDescribe + "，署名：" + UserName + "，邮箱：" + UserEmail + "，版权方：" + UserCopyright;
  formData = new FormData();
  formData.append("file", document.getElementById('file-uploader').files[0]);
  formData.append("SendMessage", sendMessage); //需要上传的多个参数
  var reg = /^\w+@\w+\.\w+$/i;
  if (UserTitle == null || UserTitle == "" || UserDescribe == null || UserDescribe == "" || UserName == null || UserName == "" || UserEmail == null || UserEmail == "" || UserCopyright == null || UserCopyright == "" || typeof(fileName) == "undefined") {
    window.electronAPI.outAlert("您未将所有内容填写完整！所有内容均为必填，请填写完整。");
    return false;
  } else if (reg.test(UserEmail)) {
    fetch('https://api.discoverse.space/get-submission/get-submission.php', {
      method: 'POST',
      body: formData
    }).then(res => {
      if (res.ok) {
        console.log('success');
        console.log(res);
        try {
          return res.json();
        } catch (err) { //服务器返回值不是JSON，错误代码：0x1
          document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
          window.electronAPI.outAlert("提交失败(20秒后自动刷新)。如多次重试依旧失败，请联系我们。错误代码：0x1");
          document.getElementById('submit-button').onclick = null;
          console.log(err.message);
          console.log("NOT A JSON,0x1");
          return 0
        };
      } else {
        document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
        window.electronAPI.outAlert("提交失败(20秒后自动刷新)。如多次重试依旧失败，请联系我们。错误代码：0x2"); //本地上传失败，根本就没传到服务器上去，错误代码：0x2
        document.getElementById('submit-button').onclick = null;
        console.log(res);
        console.log("CANNOT TO SEVER,0x2");
      }
    }).then(res => {
      const sentResult = res.msg;
      if (sentResult == "OK") {
        document.getElementById('submit-button').value = "提交成功 (20秒后自动刷新)";
        window.electronAPI.outAlert("提交成功 (20秒后自动刷新)，如果图片入选，我们会在七天内邮件联系你。如未联系，则视为未入选。");
        document.getElementById('submit-button').onclick = null;
        setTimeout("location.reload()", 20000);
        console.log("SUCCEED");
      } else if (sentResult == "error") {
        document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
        window.electronAPI.outAlert("提交失败(20秒后自动刷新)。如多次重试依旧失败，请联系我们。错误代码：0x3"); //服务器邮件发送失败，可能是SMTP问题，也可能是垃圾邮件，错误代码：0x3
        document.getElementById('submit-button').onclick = null;
        setTimeout("location.reload()", 20000);
        console.log("SERVER MAIL SENT ERROR,0x3");
      } else if (res == 0) {
        setTimeout("location.reload()", 20000);
      } else if (sentResult == "outoffile") {
        document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
        window.electronAPI.outAlert("提交失败(20秒后自动刷新)，上传的不是图片，或者大小超过5M。如多次重试依旧失败，请联系我们。错误代码：0x5"); //后端判断上传的不是图片，或者大小超过5M，错误代码：0x5
        document.getElementById('submit-button').onclick = null;
        setTimeout("location.reload()", 20000);
        console.log("BACKEND SAYS IT IS NOT A PHOTO OR IT IS TOO LARGE,0x5");
      } else {
        document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
        window.electronAPI.outAlert("提交失败(20秒后自动刷新)。如多次重试依旧失败，请联系我们。错误代码：0x6"); //真不知道什么原因，错误代码：0x6
        document.getElementById('submit-button').onclick = null;
        setTimeout("location.reload()", 20000);
        console.log("WHAT THE FUCK,0x6");
      };
    });
    document.getElementById('submit-button').value = "提交中，请等待…… (预计需要至少 40 秒，切勿切换或关闭页面)";

    function timeoutle() {
      document.getElementById('submit-button').value = "提交超时, 请重试 (20秒后自动刷新)";
      window.electronAPI.outAlert("提交超时, 请重试 (20秒后自动刷新)。错误代码：0x4"); //本地上传超时5分钟，错误代码：0x4
      document.getElementById('submit-button').onclick = null;
      setTimeout("location.reload()", 20000);
      console.log("OVER FIVE MINUTES,0x4");
    }
    document.getElementById('submit-button').onclick = null;
    setTimeout("timeoutle()", 300000);
  } else {
    window.electronAPI.outAlert("电子邮件格式错误！");
    return false
  }
}