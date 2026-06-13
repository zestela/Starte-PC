<template>
  <div class="vici-detail-wrapper px-12 py-6 pt-[60px]">
    <button @click="$router.back()"
      class="bg-[#313131] border-0 text-white px-4 py-2 rounded-lg cursor-pointer mb-4">
      ← 返回
    </button>
    <div class="article">
      <div class="title" v-html="title"></div>
      <div class="detail" v-html="detail"></div>
      <div class="content" v-html="content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const title = ref('')
const detail = ref('')
const content = ref('')

onMounted(async () => {
  const id = route.query.id
  if (!id) return
  try {
    const data = await api(`https://api.zestela.co/vicissitudes/get-vici-by-id.php?id=${encodeURIComponent(id)}`)
    const art = data.data
    const d = new Date(art.date)
    title.value = art.title
    detail.value = `${art.author} / ${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 / ${art.category}`
    content.value = art.content
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.vici-detail-wrapper {
  background-color: #181818;
  min-height: 100%;
}
</style>
