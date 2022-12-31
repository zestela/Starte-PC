const dropArea = document.querySelector('.dropArea');
const tip = document.querySelector('.tip');
const file = document.querySelector('input[type="file"]');

var el = document.getElementById('userDesctibe');
el.addEventListener('input',function () {
   var len =  txtCount(this); //   调用函数 
    document.getElementById('textCount').innerHTML = len;
});

function txtCount(el) {
    var val = el.value; 
    var eLen = val.length; 
    return eLen;
}

      function ignoreDrag(e) {
        e.preventDefault();	// 取消默认行为
        // e.stopPropagation();	// 阻止冒泡
      }
  
      function fileinfo() {
        file.onchange = function() {
          for (var i = 0; i < this.files.length; i++) {
            // 隐藏提示文字
            filefile = document.getElementById('file-uploader').files[0];
            const fileMaxSize = 1024*1024*5;
            fileName = document.getElementById('file-uploader').files[0].name;
            imgUrl = document.getElementById('file-uploader').files[0].path;
            if (filefile.size > fileMaxSize) {
              alert('图片大小不超过5M！')
            } else {
              var img = new Image();
              img_src = window.URL.createObjectURL(this.files[i]);
              img.src = img_src;
            if(document.getElementById("compress-list-item")){ 
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
                  wrap.setAttribute('id','compress-list-item');
                  dropArea.appendChild(wrap);
  
                  // 创建背景缩略图
                  var item = document.createElement('div');
                  item.className = 'compress-list-preview';
                  item.setAttribute('id','compress-list-preview');
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
  var sendMessage = "标题："+UserTitle+"，描述："+UserDescribe+"，署名："+UserName+"，邮箱："+UserEmail+"，版权方："+UserCopyright; 

  formData = new FormData();
  formData.append("file",document.getElementById('file-uploader').files[0]);  
  formData.append("SendMessage", sendMessage);//需要上传的多个参数

  var reg = /^\w+@\w+\.\w+$/i;

  if (UserTitle==null||UserTitle==""||UserDescribe==null||UserDescribe==""||UserName==null||UserName==""||UserEmail==null||UserEmail==""||UserCopyright==null||UserCopyright==""||typeof(fileName)=="undefined"){
    alert("所有内容均为必填，请填写完毕再提交！");
    return false;
  } else {
    if (reg.test(UserEmail)){
        fetch('https://api.discoverse.space/get-submission/get-submission.php', {
          method: 'POST',
          body: formData
        }).then(res => {
          if(res.ok) {
            console.log('success');
            console.log(res);
            try {
              return res.json();
            }
            catch(err) {
              document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
              alert("提交失败, 服务器返回值不是 Json。 (20秒后自动刷新)。如多次重试依旧失败，请联系我们。");
              document.getElementById('submit-button').onclick =null;
              setTimeout("location.reload()", 20000);
              console.log(err.message);
              return 0
            };
          } else {
            document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
            alert("提交失败, 这是网络问题。 (20秒后自动刷新)。如多次重试依旧失败，请联系我们。");
            document.getElementById('submit-button').onclick =null;
            setTimeout("location.reload()", 20000);
            console.log(res)
          }
        }).then(res => {
          const sentResult = res.msg;
          if(sentResult=="OK") {
            document.getElementById('submit-button').value = "提交成功 (20秒后自动刷新)";
            alert("提交成功 (20秒后自动刷新)，如果图片入选，我们会在七天内邮件联系你。如未联系，则视为未入选。");
            document.getElementById('submit-button').onclick =null;
            setTimeout("location.reload()", 20000);
          } else {
            if(sentResult=="error"||res==0) {
              document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
              alert("提交失败, 请检查内容中是否有垃圾内容，并重试 (20秒后自动刷新)。如多次重试依旧失败，请联系我们。");
              document.getElementById('submit-button').onclick =null;
              setTimeout("location.reload()", 20000);
            } else {
              document.getElementById('submit-button').value = "提交失败, 请重试 (20秒后自动刷新)";
              alert("提交失败, 这是后端服务器问题。如多次重试依旧失败，请联系我们。");
              document.getElementById('submit-button').onclick =null;
              setTimeout("location.reload()", 20000);
            }
          };
        })
      document.getElementById('submit-button').value = "提交中，请等待…… (预计需要至少 40 秒，切勿切换或关闭页面)";
      function timeoutle() {
        document.getElementById('submit-button').value = "提交超时, 请重试 (20秒后自动刷新)";
        alert("提交超时, 请重试 (20秒后自动刷新)");
        document.getElementById('submit-button').onclick =null;
        setTimeout("location.reload()", 20000);
      }
      document.getElementById('submit-button').onclick =null;
      setTimeout("timeoutle()", 300000);
    } else {
      alert("电子邮件格式错误！");
      return false
    }
    };
  }