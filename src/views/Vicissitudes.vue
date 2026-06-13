<template>
  <div class="vicissitudes-wrapper">
    <div class="top-bg-photo" :style="{ backgroundImage: topBgImage }">
      <div class="date-all">
        <div class="date">{{ month }} 月 {{ day }} 日</div>
        <div class="day">{{ dayName }}</div>
      </div>
      <div class="go-to-today" @click="$router.push('/main')">
        <IconView class="view-icon"/>
        <div class="top-photo-title">{{ todayTitle }}</div>
        <IconGoTo class="go-to-icon"/>
      </div>
    </div>
    <div class="vicissitudes-container">
      <div class="vicissitudes-left">
        <div class="vicissitudes-left-title">
          <div v-for="(tab, i) in tabs" :key="tab.key"
               :class="['vicissitudes-tab', { 'vicissitudes-left-title-current': activeTab === i }]"
               @click="activeTab = i">{{ tab.label }}</div>
        </div>
        <div v-for="(tab, i) in tabs" :key="'panel-'+tab.key"
             :class="activeTab === i ? 'vicissitudes-left-content' : 'vicissitudes-left-card-notshow'">
          <div v-for="art in tab.articles" :key="art.id" class="vicissitudes-left-card"
               @click="$router.push({ name: 'vicissitudes-detail', query: { id: art.id } })">
            <div class="p-[15px]">
              <div class="card-title">{{ art.title }}</div>
              <div class="card-describe">{{ art.summary }}</div>
              <div class="card-detail">{{ art.author }} / {{ art.dateStr }} / {{ art.category }}</div>
            </div>
          </div>
          <div v-if="!tab.articles.length" class="text-gray-500 p-5">暂无内容</div>
        </div>
      </div>
      <div class="vicissitudes-right">
        <div class="vicissitudes-right-title"><IconLatestPosts /><div>近期更新</div></div>
        <div class="vicissitudes-right-content">
          <div v-for="art in recentArticles" :key="art.id" class="vicissitudes-left-card"
               @click="$router.push({ name: 'vicissitudes-detail', query: { id: art.id } })">
            <div class="p-[15px]">
              <div class="card-title">{{ art.title }}</div>
              <div class="card-describe">{{ art.summary }}</div>
              <div class="card-detail">{{ art.author }} / {{ art.dateStr }} / {{ art.category }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { api } from '../utils/api'
import { IconView, IconGoTo, IconLatestPosts } from '../components/icons'

const store = useAppStore()
const tabs = ref([
  { key: 'rec', label: '推荐', articles: [] },
  { key: 'novel', label: '小说', articles: [] },
  { key: 'kepu', label: '科普', articles: [] },
])
const activeTab = ref(0)
const recentArticles = ref([])
const topBgImage = ref('')

const now = new Date()
const month = now.getMonth() + 1
const day = now.getDate()
const dayName = ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()]

const todayTitle = computed(() => {
  return store.mainpageData ? '今日 : ' + store.mainpageData.title : ''
})

onMounted(async () => {
  // 设置背景（独立 try-catch，不影响数据加载）
  try {
    if (store.mainpageData?.id) {
      const dataUrl = await window.electronAPI.readCacheFile(store.mainpageData.id + '.png')
      topBgImage.value = `url('${dataUrl}')`
    }
  } catch (e) { console.error('背景加载失败:', e) }

  try {
    const data = await api('https://api.zestela.co/vicissitudes/vicissitudes.php')
    const list = data.data
    const today = new Date()
    const todayTime = today.getTime()
    const cutoff = todayTime - 1296000000

    for (let i = Object.keys(list).length - 1; i >= 0; i--) {
      const art = list[i]
      const d = new Date(art.date)
      art.dateStr = `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`

      const card = art
      if (art.ifRecm === 'true') tabs.value[0].articles.push(card)
      if (art.category === '小说') tabs.value[1].articles.push(card)
      else if (art.category === '科普') tabs.value[2].articles.push(card)
      if (d.getTime() < todayTime && d.getTime() > cutoff) recentArticles.value.push(card)
    }
  } catch (e) {
    console.error('vicissitudes error:', e)
  }
})
</script>

<style scoped>
.vicissitudes-wrapper {
  background-color: #181818;
  min-height: 100%;
}
</style>
