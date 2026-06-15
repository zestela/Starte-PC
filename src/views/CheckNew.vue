<template>
  <div class="w-full h-full flex items-center justify-center overflow-hidden bg-black text-white pt-[45px]">
    <div class="flex flex-col items-center">
      <!-- 状态文字 -->
      <div class="text-[22px] font-medium text-white">{{ statusText }}</div>

      <!-- 新版本信息 -->
      <div
        v-if="hasUpdate"
        class="mt-6 w-[400px] bg-[#2a2a2a] rounded-xl p-6 flex flex-col gap-4"
      >
        <!-- 版本信息 -->
        <div>
          <div class="text-[18px] font-medium text-white">{{ newVersion }}</div>
          <div class="text-[13px] text-white/50 mt-1">{{ newDate }}</div>
        </div>

        <!-- 更新日志 -->
        <div v-if="releaseNotes" class="text-[13px] text-white/70 bg-black/30 rounded-lg p-3">
          <div class="font-medium text-white mb-2">更新内容</div>
          <div>{{ releaseNotes }}</div>
        </div>

        <!-- 下载进度 -->
        <div v-if="downloading" class="space-y-2">
          <div class="flex justify-between text-[13px]">
            <span>下载进度</span>
            <span>{{ downloadPercent }}%</span>
          </div>
          <div class="h-2 bg-[#3a3a3a] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#5D55FF] transition-all duration-300"
              :style="{ width: downloadPercent + '%' }"
            ></div>
          </div>
          <div class="text-[12px] text-white/50 text-center">
            {{ formatFileSize(downloadedBytes) }} / {{ formatFileSize(totalBytes) }}
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
          <a
            v-if="updateWeb"
            :href="updateWeb"
            target="_blank"
            class="flex-1 bg-[#383838] hover:bg-[#454545] py-3 rounded-lg text-center text-[15px] font-medium transition-colors"
          >
            更新日志
          </a>
          <button
            v-if="!downloading && !downloaded"
            @click="startDownload"
            class="flex-1 bg-[#5D55FF] hover:bg-[#6B63FF] py-3 rounded-lg text-[15px] font-medium transition-colors"
          >
            下载更新
          </button>
          <button
            v-if="downloaded"
            @click="installUpdate"
            class="flex-1 bg-[#5D55FF] hover:bg-[#6B63FF] py-3 rounded-lg text-[15px] font-medium transition-colors"
          >
            安装更新
          </button>
          <button
            v-if="downloading"
            disabled
            class="flex-1 bg-[#383838] py-3 rounded-lg text-[15px] font-medium cursor-not-allowed"
          >
            下载中...
          </button>
        </div>
      </div>

      <!-- 检查更新按钮 -->
      <button
        @click="checkUpdate"
        :disabled="checking"
        class="mt-5 px-8 py-3 bg-[#5D55FF] hover:bg-[#6B63FF] rounded-lg text-[15px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ checking ? '检查中...' : '检查更新' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const statusText = ref('正在检查更新……')
const hasUpdate = ref(false)
const newVersion = ref('')
const newDate = ref('')
const updateWeb = ref('')
const releaseNotes = ref('')
const downloading = ref(false)
const downloaded = ref(false)
const downloadPercent = ref(0)
const downloadedBytes = ref(0)
const totalBytes = ref(0)
const checking = ref(false)

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function checkUpdate() {
  checking.value = true
  statusText.value = '正在检查更新……'
  hasUpdate.value = false
  downloaded.value = false
  downloading.value = false
  
  try {
    const result = await window.electronAPI.checkUpdate()
    if (!result.success) {
      statusText.value = '检查失败，请重试'
    }
  } catch (e) {
    statusText.value = '检查失败，请重试'
  } finally {
    checking.value = false
  }
}

async function startDownload() {
  downloading.value = true
  downloadPercent.value = 0
  
  try {
    const result = await window.electronAPI.downloadUpdate()
    if (!result.success) {
      statusText.value = '下载失败，请重试'
      downloading.value = false
    }
  } catch (e) {
    statusText.value = '下载失败，请重试'
    downloading.value = false
  }
}

async function installUpdate() {
  try {
    await window.electronAPI.installUpdate()
  } catch (e) {
    statusText.value = '安装失败，请重试'
  }
}

function handleUpdateStatus(event, status) {
  switch (status.type) {
    case 'update-available':
      hasUpdate.value = true
      newVersion.value = status.version
      newDate.value = status.releaseDate ? '发布时间：' + new Date(status.releaseDate).toLocaleDateString() : ''
      releaseNotes.value = status.notes || ''
      statusText.value = '发现新版本'
      break
    case 'update-not-available':
      hasUpdate.value = false
      statusText.value = '你使用的是最新版本'
      break
    case 'download-progress':
      downloadPercent.value = status.percent
      downloadedBytes.value = status.downloaded
      totalBytes.value = status.total
      break
    case 'update-downloaded':
      downloading.value = false
      downloaded.value = true
      statusText.value = '更新已下载完成'
      break
    case 'update-error':
      downloading.value = false
      statusText.value = status.message || '更新失败'
      break
  }
}

onMounted(async () => {
  window.electronAPI.onUpdateStatus(handleUpdateStatus)
  await checkUpdate()
})

onUnmounted(() => {
  window.electronAPI.removeUpdateStatusListener(handleUpdateStatus)
})
</script>
