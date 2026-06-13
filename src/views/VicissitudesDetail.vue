<template>
  <div class="vici-detail-wrapper w-full h-full overflow-y-auto">
    <div class="max-w-3xl mx-auto px-8 py-6 pt-[60px]">
      <button @click="$router.back()"
        class="bg-[#313131] border-0 text-white px-4 py-2 rounded-lg cursor-pointer mb-8 hover:bg-[#454545] transition-colors">
        ← 返回
      </button>
      <article class="mt-12">
        <h1 class="text-[26px] text-white font-bold mb-3" v-html="title"></h1>
        <div class="text-[14px] text-white/60 font-semibold mb-8" v-html="detail"></div>
        <div class="prose prose-invert max-w-none">
          <div class="text-[15px] leading-[1.8] text-white font-normal pb-12" v-html="content"></div>
        </div>
      </article>
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
}

/* 优化正文排版 */
.prose :deep(p) {
  margin-bottom: 1em;
  text-align: justify;
}

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4) {
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  color: white;
}

.prose :deep(h1) { font-size: 24px; }
.prose :deep(h2) { font-size: 22px; }
.prose :deep(h3) { font-size: 20px; }
.prose :deep(h4) { font-size: 18px; }

.prose :deep(img) {
  border-radius: 10px;
  width: 100%;
  margin: 1.5em 0;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin: 1em 0;
  padding-left: 1.5em;
  text-align: justify;
}

.prose :deep(li) {
  margin: 0.5em 0;
}

.prose :deep(a) {
  color: #5D55FF;
  text-decoration: underline;
}

.prose :deep(blockquote) {
  border-left: 4px solid #5D55FF;
  padding-left: 1em;
  margin: 1em 0;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.prose :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

.prose :deep(pre) {
  background: rgba(255, 255, 255, 0.05);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}
</style>
