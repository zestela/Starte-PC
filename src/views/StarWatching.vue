<template>
  <div id="star-list" ref="starList">
    <div v-for="item in items" :key="item.id" class="star-watching-slide" :id="item.id">
      <div class="star-watching-in-list star-fade-in">
        <img class="card-img" :src="item.bg || '/loading-bg.png'" loading="lazy" alt="" @error="onImgError">
        <div class="texts">
          <div>
            <h1>{{ item.sentence }}</h1>
            <h3>{{ item.from }}</h3>
          </div>
        </div>
        <div class="star-watching-bottom">
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../utils/api'
import { IconShare } from '../components/icons'

const router = useRouter()
const route = useRoute()
const items = ref([])
const starList = ref(null)

function scrollToItem(id) {
  if (!id) return
  nextTick(() => {
    const index = items.value.findIndex(item => String(item.id) === String(id))
    if (index >= 0 && starList.value) {
      const slideHeight = starList.value.querySelector('.star-watching-slide')?.offsetHeight || 0
      starList.value.scrollTo({ top: slideHeight * index, behavior: 'smooth' })
    }
  })
}

function onImgError(e) {
  const el = e.target
  if (el.dataset.fallback) return  // 兜底图也失败，避免死循环
  el.dataset.fallback = '1'
  el.src = '/loading-bg.png'
}

async function share(item) {
  try {
    // 等待图片下载完成
    const result = await window.electronAPI.share(item.bgId)

    if (!result.success) {
      window.electronAPI.outAlert('图片加载失败，请重试')
      return
    }

    // 下载成功后跳转，传递完整数据
    router.push({
      name: 'share',
      query: {
        id: item.bgId,
        title: item.sentence,
        describe: item.from
      }
    })
  } catch (err) {
    console.error('分享失败:', err)
    window.electronAPI.outAlert('分享失败，请重试')
  }
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
    scrollToItem(route.query.scrollTo)
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
/* 简单的淡入动画 - 依赖浏览器原生图片加载 */
.star-fade-in {
  animation: fadeInBackground 0.6s ease-out;
}

@keyframes fadeInBackground {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
