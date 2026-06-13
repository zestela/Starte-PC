<template>
  <div id="star-list" @wheel.prevent="onWheel">
    <div v-for="item in items" :key="item.id" class="star-watching-in-list"
         :id="item.id" :style="{ backgroundImage: `url(${item.bg}),url(/loading-bg.png)` }">
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
        <button class="onhover special-onhover" style="padding:3px" @click="share(item)">
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

function onWheel(e) { e.currentTarget.scrollLeft += e.deltaY }
function share(item) {
  window.electronAPI.share(item.bgId, 1)
  router.push({ name: 'share', query: { id: item.bgId, type: '1' } })
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
  } catch (e) { console.error(e) }
})
</script>
