<template>
  <div class="popup-wrapper">
    <div class="popup-header app-drag">{{ title }}</div>
    <div class="popup-content" v-html="msg" @click.stop="onContentClick"></div>
    <div class="popup-actions">
      <template v-if="type === 'info'">
        <button class="btn-copy" @click="copyMsg">复制内容</button>
        <button class="btn-ok" @click="close">知道了</button>
      </template>
      <template v-else-if="type === 'choice'">
        <button
          v-for="c in choices"
          :key="c.key"
          class="btn-ok"
          :style="{ flex: 1 }"
          @click="sendChoice(c.key)"
        >{{ c.label }}</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const title = ref('提示')
const msg = ref('')
const type = ref('info')
const choices = ref([])

async function close() {
  window.electronAPI.popupClose()
}

async function sendChoice(key) {
  window.electronAPI.popupSendChoice(key)
}

async function copyMsg() {
  try {
    await navigator.clipboard.writeText(msg.value)
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = msg.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  const btn = document.querySelector('.btn-copy')
  if (btn) {
    const old = btn.textContent
    btn.textContent = '已复制！'
    setTimeout(() => { btn.textContent = old }, 1200)
  }
}

function onContentClick() {}

onMounted(async () => {
  msg.value = await window.electronAPI.getPopupMsg()
  type.value = await window.electronAPI.getPopupType()
  const data = await window.electronAPI.getPopupData()
  if (data && data.title) title.value = data.title
  if (data && data.choices) choices.value = data.choices
})
</script>

<style scoped>
.popup-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  background-color: #181818;
  padding: 16px;
  box-sizing: border-box;
  gap: 12px;
}

.app-drag {
  -webkit-app-region: drag;
}

.popup-header {
  color: white;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  cursor: default;
}

.popup-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: auto;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 14px;
  user-select: text;
  -webkit-user-select: text;
  word-break: break-word;
  white-space: pre-wrap;
}

.popup-content::-webkit-scrollbar { width: 6px; height: 6px; }
.popup-content::-webkit-scrollbar-corner { background-color: transparent; }
.popup-content::-webkit-scrollbar-thumb { border-radius: 6px; background: rgba(255,255,255,0.25); }
.popup-content::-webkit-scrollbar-track { border-radius: 6px; background: transparent; }
.popup-content::-webkit-scrollbar-button { display: none; }

.popup-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-ok {
  background: rgba(93, 85, 255, 0.9);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s;
}
.btn-ok:hover { background: rgba(93, 85, 255, 1); }

.btn-copy {
  background: #313131;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: background-color 0.15s;
  white-space: nowrap;
}
.btn-copy:hover { background: #454545; }
</style>
