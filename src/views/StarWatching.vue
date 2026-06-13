<template>
  <div id="star-list" @wheel.prevent="onWheel">
    <div v-for="item in items" :key="item.id" class="star-watching-in-list relative"
         :id="item.id" :style="{ backgroundImage: `url(${item.bg}),url(/loading-bg.png)` }">
      <!-- 加载骨架屏 -->
      <div v-if="!imageLoaded(item.bg)"
           class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse">
        <div class="absolute top-1/3 left-12 right-12">
          <div class="h-10 bg-white/10 rounded-lg mb-3 w-3/4"></div>
          <div class="h-6 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 实际内容 -->
      <div class="texts" :class="{ 'opacity-0': !imageLoaded(item.bg), 'animate-fadeIn': imageLoaded(item.bg) }">
        <div>
          <h1>{{ item.sentence }}</h1>
          <h3>{{ item.from }}</h3>
        </div>
      </div>
      <div class="star-watching-bottom" :class="{ 'opacity-0': !imageLoaded(item.bg), 'animate-fadeIn': imageLoaded(item.bg) }">
        <div class="disPLAYDATE">
          <div class="month">{{ item.month }}</div>
          <div class="fenge"> / </div>
          <div class="dayte">{{ item.day }}</div>
        </div>
        <button class="onhover special-onhover p-[3px]" @click="share(item)">
          <IconShare />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'
import { IconShare } from '../components/icons'

const router = useRouter()
const items = ref([])
const loadedImages = ref(new Set())

function onWheel(e) { e.currentTarget.scrollLeft += e.deltaY }

function share(item) {
  window.electronAPI.share(item.bgId, 1)
  router.push({ name: 'share', query: { id: item.bgId, type: '1' } })
}

function imageLoaded(url) {
  return loadedImages.value.has(url)
}

// 图片预加载函数
function preloadImage(url) {
  if (loadedImages.value.has(url)) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      loadedImages.value.add(url)
      resolve()
    }
    img.onerror = () => {
      loadedImages.value.add(url)
      resolve()
    }
    img.src = url
  })
}

onMounted(async () => {
  try {
    const [sData, wData] = await Promise.all([
      api('https://api.zestela.co/new-book/new-get-book-sentence-list.php'),
      api('https://api.zestela.co/new-book/new-get-mainpage-list.php')
    ])
    const list = Object.values(sData.data).reverse()
    items.value = list.map((it, i) => {
      const d = new Date(it.date)
      return {
        ...it,
        from: '—— ' + it.from,
        month: d.getMonth()+1,
        day: d.getDate(),
        bg: wData.data[list.length-1-i]?.url || '',
        bgId: wData.data[list.length-1-i]?.id || it.id
      }
    })

    // 预加载前3张图片
    const topImages = items.value.slice(0, 3).map(it => it.bg).filter(Boolean)
    topImages.forEach(url => preloadImage(url))
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.texts,
.star-watching-bottom {
  transition: opacity 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease forwards;
}
</style>
