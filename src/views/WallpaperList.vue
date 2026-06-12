<template>
  <div id="wallpaper-list">
    <div v-for="item in items" :key="item.id" class="wallpaper-in-list"
         :id="item.id" :style="{ backgroundImage: `url(${item.url}),url(/loading-bg.png)` }">
      <div><div>
        <div class="title-and-icons">
          <h1>{{ item.title }}</h1>
          <div class="image-action-icons">
            <button class="onhover special-onhover" style="padding:3.5px" @click="window.electronAPI.setWallpaper(item.id)">
              <img class="icon-set-wallpaper"/>
            </button>
            <button class="onhover special-onhover" style="padding:3.5px" @click="share(item)">
              <img class="icon-share"/>
            </button>
          </div>
        </div>
        <div class="disPLAYDATE">
          <div class="month">{{ item.month }}</div>
          <div class="fenge"> / </div>
          <div class="dayte">{{ item.day }}</div>
        </div>
      </div></div>
      <h3>{{ item.describe }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

const router = useRouter()
const items = ref([])

function share(item) {
  window.electronAPI.share(item.id, 0)
  router.push({ name: 'share', query: { id: item.id, type: '0' } })
}

onMounted(async () => {
  try {
    const data = await api('https://api.zestela.co/new-mainpage/get-mainpage-history-list.php')
    items.value = Object.values(data.data).reverse().map(it => {
      const d = new Date(it.date)
      return { ...it, month: d.getMonth()+1, day: d.getDate() }
    })
  } catch (e) { console.error(e) }
})
</script>
