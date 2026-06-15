<template>
  <div class="vici-detail-wrapper w-full h-full overflow-y-auto"
       @contextmenu.prevent="showMenu($event)"
       @click="hideMenu"
       @scroll="hideMenu">
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

    <!-- 自定义右键菜单 -->
    <div v-if="menuVisible"
         class="context-menu"
         :style="{ top: menuY + 'px', left: menuX + 'px' }"
         @click.stop>
      <div class="context-menu-item" @click.stop="doCopy">
        <svg class="context-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="9" y="9" width="11" height="11" rx="2"/>
          <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
        </svg>
        <span>复制</span>
        <span class="context-menu-hint">{{ hasSelection ? '复制选中内容' : '复制全文' }}</span>
      </div>
      <div class="context-menu-item" @click.stop="openFeedback">
        <svg class="context-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>反馈</span>
        <span class="context-menu-hint">zestela.co/support</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../utils/api'

const route = useRoute()
const title = ref('')
const detail = ref('')
const content = ref('')

// 右键菜单状态
const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const hasSelection = ref(false)

function showMenu(e) {
  // 防止从 Electron 主菜单冒泡冲突 —— 只在页面区域响应
  menuX.value = e.clientX
  menuY.value = e.clientY
  hasSelection.value = !!window.getSelection()?.toString().trim()
  menuVisible.value = true
}

function hideMenu() {
  menuVisible.value = false
}

function doCopy() {
  const selection = window.getSelection()?.toString().trim()
  const textToCopy = selection || (title.value + '\n\n' + detail.value + '\n\n' + content.value?.replace(/<[^>]+>/g, '') || '')
  if (!textToCopy) return
  navigator.clipboard?.writeText(textToCopy).catch(() => {
    // 兼容老浏览器的兜底方案
    const ta = document.createElement('textarea')
    ta.value = textToCopy
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
  hideMenu()
}

function openFeedback() {
  window.open('https://zestela.co/support', '_blank')
  hideMenu()
}

function onDocClick(e) {
  // 点击菜单项以外区域关闭菜单
  if (!e.target.closest?.('.context-menu')) hideMenu()
}

onMounted(async () => {
  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideMenu() })
  window.addEventListener('resize', hideMenu)

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

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocClick)
  window.removeEventListener('resize', hideMenu)
})
</script>

<style scoped>
.vici-detail-wrapper {
  background-color: #181818;
}

/* 允许文章区域复制文本（body 全局默认禁用 user-select） */
.vici-detail-wrapper article {
  user-select: text;
  -webkit-user-select: text;
}

/* 自定义选中高亮色：用主题紫色 + 白色文字，替代浏览器默认蓝色 */
.vici-detail-wrapper :deep(::selection) {
  background: rgba(93, 85, 255, 0.55);
  color: #ffffff;
}
.vici-detail-wrapper :deep(::-moz-selection) {
  background: rgba(93, 85, 255, 0.55);
  color: #ffffff;
}

/* 自定义右键菜单 —— 与整体深色 + 紫色毛玻璃风格一致 */
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 220px;
  padding: 6px;
  background: rgba(24, 24, 24, 0.92);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  user-select: none;
  animation: menuFadeIn 0.14s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.context-menu-item:hover {
  background: rgba(93, 85, 255, 0.35);
  color: #ffffff;
}

.context-menu-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  flex-shrink: 0;
}

.context-menu-item:hover .context-menu-icon {
  opacity: 1;
  color: #5D55FF;
}

.context-menu-hint {
  margin-left: auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 400;
}

.context-menu-item:hover .context-menu-hint {
  color: rgba(255, 255, 255, 0.55);
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
