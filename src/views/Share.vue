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
const title = ref('加载中...')
const describe = ref('加载中...')
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

// 立即从 query 读取参数
const queryId = route.query.id
const queryTitle = route.query.title
const queryDescribe = route.query.describe

console.log('Share 初始化参数:', { queryId, queryTitle, queryDescribe })

// 立即赋值（同步）
if (queryTitle) {
  title.value = queryTitle
  console.log('title 已设置:', title.value)
}

if (queryDescribe) {
  describe.value = queryDescribe
  console.log('describe 已设置:', describe.value)
}

onMounted(async () => {
  console.log('onMounted - title:', title.value, 'describe:', describe.value)

  if (!queryId) {
    console.error('缺少 id 参数')
    return
  }

  // 读取缓存图片
  try {
    const dataUrl = await window.electronAPI.readCacheFile(queryId + '.png')
    picUrl.value = dataUrl
    console.log('图片加载成功')
  } catch (e) {
    console.error('读取缓存图片失败:', e)
    // 重试一次
    await new Promise(r => setTimeout(r, 1000))
    try {
      const dataUrl = await window.electronAPI.readCacheFile(queryId + '.png')
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
