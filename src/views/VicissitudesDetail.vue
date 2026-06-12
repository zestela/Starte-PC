<template>
  <div style="padding:24px 48px">
    <button @click="$router.back()"
      style="background:#313131;border:none;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;margin-bottom:16px">
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

const route = useRoute()
const title = ref('')
const detail = ref('')
const content = ref('')

onMounted(async () => {
  const id = route.query.id
  if (!id) return
  try {
    const res = await fetch(`https://api.zestela.co/vicissitudes/get-vici-by-id.php?id=${encodeURIComponent(id)}`)
    const data = await res.json()
    const art = data.data
    const d = new Date(art.date)
    title.value = art.title
    detail.value = `${art.author} / ${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 / ${art.category}`
    content.value = art.content
  } catch (e) { console.error(e) }
})
</script>
