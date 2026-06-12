<template>
  <div class="setting-contain">
    <div class="setting-left">
      <div class="setting-nav" @click="$router.push('/settings')">
        <img class="icon-settings-normal"/>
        <div class="setting-nav-text"><div class="setting-nav-text-title">功能</div></div>
      </div>
      <div class="setting-nav" style="margin-top:16px" @click="$router.push('/settings?tab=about')">
        <img class="icon-settings-about"/>
        <div class="setting-nav-text"><div class="setting-nav-text-title">关于</div></div>
      </div>
    </div>
    <div class="setting-right" style="display:flex;justify-content:center;align-items:center">
      <div class="check-new-container">
        <img src="/src/icons/check-new.png" width="80px"/>
        <div class="check-new-title" style="margin-top:20px">{{ statusText }}</div>
        <div :class="['new-banben', { 'new-banben-checked': hasUpdate }]" v-if="hasUpdate">
          <div style="margin-left:23px;display:flex;align-items:center">
            <img src="/color-logo.png" width="50px"/>
            <div style="margin-left:16px">
              <div class="check-new-title">{{ newVersion }}</div>
              <div class="check-new-describe">{{ newDate }}</div>
            </div>
          </div>
          <div class="getbuttons">
            <a class="get-rizhi" :href="updateWeb" target="_blank"><div style="color:white;font-size:15px">更新日志</div></a>
            <button class="get-new" @click="copyLink"><div style="color:white;font-size:15px">{{ copyText }}</div></button>
          </div>
        </div>
        <button style="margin-top:20px" class="check-new" @click="checkUpdate">
          <div style="color:white;font-size:15px">检查更新</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusText = ref('正在检查更新……')
const hasUpdate = ref(false)
const newVersion = ref('')
const newDate = ref('')
const updateWeb = ref('')
const downloadLink = ref('')
const copyText = ref('复制链接')

let localVersion = ''

async function checkUpdate() {
  statusText.value = '正在检查更新……'
  hasUpdate.value = false
  try {
    const res = await fetch('https://api.zestela.co/banben.json', { cache: 'no-cache' })
    const data = await res.json()
    const latest = data.banben[0]
    newVersion.value = latest.name
    newDate.value = '发布时间：' + latest.date
    updateWeb.value = latest.updateweb
    downloadLink.value = latest.url
    if (latest.name !== localVersion) {
      hasUpdate.value = true
      statusText.value = '发现新版本'
    } else {
      statusText.value = '你使用的是最新版本'
    }
  } catch (e) {
    statusText.value = '检查失败，请重试'
  }
}

function copyLink() {
  if (!downloadLink.value) return
  navigator.clipboard.writeText(downloadLink.value).then(
    () => { copyText.value = '复制成功' },
    () => { copyText.value = '复制失败' }
  )
}

onMounted(async () => {
  localVersion = await window.electronAPI.getVersion()
  checkUpdate()
})
</script>
