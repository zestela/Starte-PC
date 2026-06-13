<template>
  <div class="min-h-full flex items-center justify-center bg-[#141414]">
    <div class="w-[70vh] bg-white" ref="shareRef">
      <img ref="mainPic" :src="picUrl" @load="onPicLoad" class="w-full select-none"/>
      <div class="px-5 pb-5 bg-white flex items-center justify-between">
        <div class="flex-1">
          <h2 class="font-light text-[25px] mt-2.5 mb-[5px] text-black">{{ title }}</h2>
          <h5 class="font-extralight mt-0 mb-0 break-words text-[#666666]">{{ describe }}</h5>
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

// 立即赋值（同步）
if (queryTitle) title.value = queryTitle
if (queryDescribe) describe.value = queryDescribe

onMounted(async () => {
  if (!queryId) {
    console.error('Share: 缺少 id 参数')
    return
  }

  // 读取缓存图片
  try {
    picUrl.value = await window.electronAPI.readCacheFile(queryId + '.png')
  } catch (e) {
    console.error('Share: 读取缓存图片失败:', e)
    // 重试一次
    await new Promise(r => setTimeout(r, 1000))
    try {
      picUrl.value = await window.electronAPI.readCacheFile(queryId + '.png')
    } catch (e2) {
      console.error('Share: 图片重试失败:', e2)
      window.electronAPI.outAlert('图片加载失败，请重试')
      return
    }
  }

  // 兜底：如果图片已缓存，直接截图
  if (mainPic.value?.complete && mainPic.value?.naturalWidth > 0) capture()
})
</script>
