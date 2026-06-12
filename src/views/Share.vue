<template>
  <div class="share-main" id="share">
    <img ref="mainPic" :src="picUrl" @load="onPicLoad"/>
    <div class="share-text-background">
      <div>
        <h2>{{ title }}</h2>
        <h5>{{ describe }}</h5>
      </div>
      <div style="display:content">
        <img src="/qrcode.png" class="share-qrcode"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const title = ref('')
const describe = ref('')
const picUrl = ref('')
const mainPic = ref(null)
let captured = false

async function capture() {
  if (captured) return
  captured = true
  const loadHtml2canvas = () => new Promise(resolve => {
    if (typeof html2canvas !== 'undefined') return resolve()
    const s = document.createElement('script')
    s.src = '/js/html2canvas.min.js'
    s.onload = resolve
    document.head.appendChild(s)
  })
  await loadHtml2canvas()
  await nextTick()
  setTimeout(() => {
    html2canvas(document.getElementById('share'), { scale: 4 }).then(canvas => {
      window.electronAPI.saveShare(canvas.toDataURL('image/jpeg', 1))
    })
  }, 500)
}

function onPicLoad() { capture() }

onMounted(async () => {
  const id = route.query.id
  const type = route.query.type
  if (!id) return

  // 图片可能还在下载中，重试读取缓存
  let dataUrl = null
  for (let i = 0; i < 10; i++) {
    try {
      dataUrl = await window.electronAPI.readCacheFile(id + '.png')
      break
    } catch (e) {
      if (i < 9) await new Promise(r => setTimeout(r, 500))
    }
  }
  if (dataUrl) picUrl.value = dataUrl

  if (type === '1') {
    const data = await api('https://api.zestela.co/new-book/new-get-book-sentence-list.php')
    const item = data.data.find(it => it.id == id)
    if (item) { title.value = item.sentence; describe.value = '—— ' + item.from }
  } else {
    const data = await api(`https://api.zestela.co/new-mainpage/get-photo-title-describe-links.php?id=${id}`)
    if (data.data) { title.value = data.data.title; describe.value = data.data.describe }
  }

  // 兜底：如果图片已缓存，直接截图
  if (mainPic.value?.complete && mainPic.value?.naturalWidth > 0) capture()
})
</script>
