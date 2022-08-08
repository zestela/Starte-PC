
var { shell } = require('electron')

var aHref = document.querySelector('#aHref') 

aHref.onclick = function(e){
    e.preventDefault()
    var href = this.getAttribute('href')
    shell.openExternal(href)
}