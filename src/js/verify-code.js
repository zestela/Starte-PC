
function f1() {
    var name=document.getElementById('code-text').value;
    var request=new XMLHttpRequest();
    var reUrl='https://api.discoverse.space/verify-code/verify-code.php?code-text='+name;
    request.open('post', reUrl);
    request.send();
    request.onreadystatechange=function () {
    if(request.readyState==4&&(request.status==200||request.status==304)){
        var reMsg = JSON.parse(request.responseText).msg;
        if(reMsg!='OK'){
            console.log("Wrong code, msg:",request.responseText);
            document.getElementById('wrong-text').setAttribute("class", "timeout-text");
        } else {
            console.log("Right code, msg:",request.responseText);
            window.electronAPI.goToPage(1);
        }
        }
    }

}
