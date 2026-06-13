<template>
  <div class="min-h-full flex items-center justify-center bg-[#141414]">
    <div class="w-[70vh] bg-white" ref="shareRef">
      <img ref="mainPic" :src="picUrl" @load="onPicLoad" class="w-full select-none"/>
      <div class="px-5 pb-5 bg-white flex items-center justify-between">
        <div>
          <h2 class="text-black font-light text-[25px] mt-2.5 mb-[5px]">{{ title }}</h2>
          <h5 class="text-black font-extralight mt-0 mb-0 break-words">{{ describe }}</h5>
        </div>
        <div class="flex">
          <img src="/qrcode.png" class="w-16 select-none"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'
import html2canvas from 'html2canvas'

const route = useRoute()
const title = ref('')
const describe = ref('')
const picUrl = ref('')
const mainPic = ref(null)
const shareRef = ref(null)
let captured = false

async function capture() {
  if (captured) return
  captured = true

  await nextTick()

  setTimeout(() => {
    if (shareRef.value) {
      html2canvas(shareRef.value, { scale: 4 }).then(canvas => {
        window.electronAPI.saveShare(canvas.toDataURL('image/jpeg', 1))
      })
    }
  }, 500)
}

function onPicLoad() { capture() }

onMounted(async () => {
  const id = route.query.id
  const type = route.query.type
  if (!id) return

  // 读取缓存图片（调用方应该已经确保下载完成）
  try {
    const dataUrl = await window.electronAPI.readCacheFile(id + '.png')
    picUrl.value = dataUrl
  } catch (e) {
    console.error('读取缓存图片失败:', e)
    // 如果还是读取失败，等待一下再重试
    await new Promise(r => setTimeout(r, 1000))
    try {
      const dataUrl = await window.electronAPI.readCacheFile(id + '.png')
      picUrl.value = dataUrl
    } catch (e2) {
      console.error('重试失败:', e2)
      window.electronAPI.outAlert('图片加载失败，请重试')
      return
    }
  }

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

