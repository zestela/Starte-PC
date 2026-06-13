<template>
  <div class="w-full h-full flex items-center justify-center overflow-hidden bg-black text-white pt-[45px]">
    <div class="flex flex-col items-center">
      <!-- 图标 -->
      <img src="/color-logo.png" class="w-20 h-20" alt="Starte"/>

      <!-- 状态文字 -->
      <div class="mt-5 text-[22px] font-medium text-white">{{ statusText }}</div>

      <!-- 新版本信息 -->
      <div
        v-if="hasUpdate"
        class="mt-6 w-[400px] bg-[#2a2a2a] rounded-xl p-6 flex flex-col gap-4"
      >
        <!-- 版本信息 -->
        <div class="flex items-center gap-4">
          <img src="/color-logo.png" class="w-[50px] h-[50px]" alt="Logo"/>
          <div>
            <div class="text-[18px] font-medium text-white">{{ newVersion }}</div>
            <div class="text-[13px] text-white/50 mt-1">{{ newDate }}</div>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
          <a
            :href="updateWeb"
            target="_blank"
            class="flex-1 bg-[#383838] hover:bg-[#454545] py-3 rounded-lg text-center text-[15px] font-medium transition-colors"
          >
            更新日志
          </a>
          <button
            @click="copyLink"
            class="flex-1 bg-[#5D55FF] hover:bg-[#6B63FF] py-3 rounded-lg text-[15px] font-medium transition-colors"
          >
            {{ copyText }}
          </button>
        </div>
      </div>

      <!-- 检查更新按钮 -->
      <button
        @click="checkUpdate"
        class="mt-5 px-8 py-3 bg-[#5D55FF] hover:bg-[#6B63FF] rounded-lg text-[15px] font-medium transition-colors"
      >
        检查更新
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'

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
    const data = await api('https://api.zestela.co/banben.json', { cache: 'no-cache' })
    if (!data) {
      statusText.value = '检查失败，请重试'
      return
    }
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


