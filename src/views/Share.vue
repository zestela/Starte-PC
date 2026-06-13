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
  const { id, title: queryTitle, describe: queryDescribe } = route.query

  console.log('Share 页面接收参数:', { id, title: queryTitle, describe: queryDescribe })
  console.log('参数类型:', typeof queryTitle, typeof queryDescribe)

  // 直接赋值，Vue Router 会自动解码
  if (queryTitle) {
    title.value = decodeURIComponent(queryTitle)
    console.log('解码后的 title:', title.value)
  } else {
    title.value = '无标题'
  }

  if (queryDescribe) {
    describe.value = decodeURIComponent(queryDescribe)
    console.log('解码后的 describe:', describe.value)
  } else {
    describe.value = ''
  }

  if (!id) {
    console.error('缺少 id 参数')
    return
  }

  // 读取缓存图片
  try {
    const dataUrl = await window.electronAPI.readCacheFile(id + '.png')
    picUrl.value = dataUrl
    console.log('图片加载成功')
  } catch (e) {
    console.error('读取缓存图片失败:', e)
    // 重试一次
    await new Promise(r => setTimeout(r, 1000))
    try {
      const dataUrl = await window.electronAPI.readCacheFile(id + '.png')
      picUrl.value = dataUrl
      console.log('图片重试加载成功')
    } catch (e2) {
      console.error('图片重试失败:', e2)
      window.electronAPI.outAlert('图片加载失败，请重试')
      return
    }
  }

  // 兜底：如果图片已缓存，直接截图
  if (mainPic.value?.complete && mainPic.value?.naturalWidth > 0) capture()
})
</script>
