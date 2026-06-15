<template>
  <div class="w-full h-full flex overflow-hidden bg-black text-white pt-[45px]">
    <!-- 左侧导航 -->
    <div class="w-1/5 h-full bg-black flex flex-col p-4">
      <button
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
        :class="tab === 'settings' ? 'bg-[#454545]' : 'hover:bg-[#2a2a2a]'"
        @click="tab = 'settings'"
      >
        <IconSettingsNormal :size="20"/>
        <span class="text-[15px] font-medium">功能</span>
      </button>

      <button
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4"
        :class="tab === 'about' ? 'bg-[#454545]' : 'hover:bg-[#2a2a2a]'"
        @click="tab = 'about'"
      >
        <IconSettingsAbout :size="20"/>
        <span class="text-[15px] font-medium">关于</span>
      </button>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 h-full overflow-hidden">
      <!-- 功能 Tab -->
      <div v-if="tab === 'settings'" class="h-full overflow-y-auto px-8 py-6">
        <!-- 自动启动设置 -->
        <div class="flex items-center justify-between py-6 border-b border-white/10">
          <div class="flex-1">
            <h3 class="text-[15px] font-medium text-white mb-2">开机开启观星记自动将更新的 Today 图片设置为桌面壁纸</h3>
            <p class="text-[13px] text-white/50">开启后，在系统设置 / 第三方软件中关闭开机自启动无效，须在此处关闭才可生效</p>
          </div>
          <div class="ml-6">
            <button
              @click="toggleAutoStart"
              class="relative w-12 h-6 rounded-full transition-colors"
              :class="autoStart ? 'bg-[#5D55FF]' : 'bg-[#3a3a3a]'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200"
                :class="autoStart ? 'translate-x-6' : 'translate-x-0'"
              ></span>
            </button>
          </div>
        </div>

        <!-- 托盘设置 -->
        <div class="flex items-center justify-between py-6">
          <div class="flex-1">
            <h3 class="text-[15px] font-medium text-white mb-2">关闭窗口时</h3>
            <p class="text-[13px] text-white/50">选择关闭主窗口时应用如何处理</p>
          </div>
          <div class="ml-6 flex gap-2">
            <button
              @click="setCloseBehavior('tray')"
              class="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
              :class="closeBehavior === 'tray'
                ? 'bg-[#5D55FF] text-white hover:bg-[#6B63FF]'
                : 'bg-[#313131] text-white/70 hover:bg-[#454545] hover:text-white'"
            >
              收起到托盘
            </button>
            <button
              @click="setCloseBehavior('quit')"
              class="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
              :class="closeBehavior === 'quit'
                ? 'bg-[#5D55FF] text-white hover:bg-[#6B63FF]'
                : 'bg-[#313131] text-white/70 hover:bg-[#454545] hover:text-white'"
            >
              退出程序
            </button>
          </div>
        </div>
      </div>

      <!-- 关于 Tab -->
      <div v-else-if="tab === 'about'" class="h-full flex items-center justify-center overflow-hidden">
        <div class="w-[70%] grid grid-cols-3 auto-rows-max gap-1.5">
          <!-- Logo 区域 -->
          <div class="col-span-2 h-[175px] bg-[#311E8F] rounded-l-xl flex items-center justify-between px-8">
            <div>
              <img class="h-[30px]" src="/text-logo.png" alt="Starte"/>
              <div class="mt-1.5 text-[13px] text-white/40">{{ version }}</div>
            </div>
            <img class="h-[70px]" src="/color-logo.png" alt="Logo"/>
          </div>

          <!-- 检查更新按钮 -->
          <div
            class="h-[175px] bg-[#383838] rounded-r-xl flex items-center justify-center cursor-pointer hover:bg-[#454545] transition-colors"
            @click="tab = 'update'"
          >
            <div class="flex items-center gap-2">
              <IconUpdate :size="25"/>
              <span class="text-[15px] font-medium">检查更新</span>
            </div>
          </div>

          <!-- GitHub 链接 -->
          <a
            href="https://github.com/zestela"
            class="h-[90px] bg-[#383838] rounded-l-xl flex items-center px-6 hover:bg-[#454545] transition-colors"
            target="_blank"
          >
            <IconGithub :size="25"/>
            <div class="ml-2.5">
              <div class="text-[15px] font-medium">GitHub</div>
              <div class="text-[13px] text-white/50">开源主页</div>
            </div>
          </a>

          <!-- 官网链接 -->
          <a
            href="https://zestela.co"
            class="h-[90px] bg-[#383838] flex items-center px-6 hover:bg-[#454545] transition-colors"
            target="_blank"
          >
            <IconWebsite :size="25"/>
            <div class="ml-2.5">
              <div class="text-[15px] font-medium">官网</div>
              <div class="text-[13px] text-white/50">了解更多</div>
            </div>
          </a>

          <!-- 赞助者链接 -->
          <a
            @click="$router.push('/donate')"
            class="h-[90px] bg-[#383838] rounded-r-xl flex items-center px-6 cursor-pointer hover:bg-[#454545] transition-colors"
          >
            <IconGroup :size="25"/>
            <div class="ml-2.5">
              <div class="text-[15px] font-medium">赞助者</div>
              <div class="text-[13px] text-white/50">感谢支持</div>
            </div>
          </a>
        </div>
      </div>

      <!-- 检查更新 Tab -->
      <div v-else class="h-full flex items-center justify-center overflow-hidden">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IconSettingsNormal, IconSettingsAbout, IconUpdate, IconGithub, IconWebsite, IconGroup } from '../components/icons'

const route = useRoute()
const tab = ref(route.query.tab === 'about' ? 'about' : 'settings')
const autoStart = ref(false)
const closeBehavior = ref('tray')
const version = ref('')

// 检查更新相关状态
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
let localVersion = ''

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function toggleAutoStart() {
  autoStart.value = !autoStart.value
  await window.electronAPI.setSetting('isSelfopen', autoStart.value)
}

async function setCloseBehavior(behavior) {
  closeBehavior.value = behavior
  await window.electronAPI.setSetting('closeBehavior', behavior)
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

watch(tab, (newTab) => {
  if (newTab === 'update' && statusText.value === '正在检查更新……') {
    checkUpdate()
  }
})

onMounted(async () => {
  autoStart.value = (await window.electronAPI.getSetting('isSelfopen')) == true
  closeBehavior.value = (await window.electronAPI.getSetting('closeBehavior')) || 'tray'
  version.value = await window.electronAPI.getVersion()
  localVersion = version.value

  window.electronAPI.onUpdateStatus(handleUpdateStatus)

  if (tab.value === 'update') {
    checkUpdate()
  }
})

onUnmounted(() => {
  window.electronAPI.removeUpdateStatusListener(handleUpdateStatus)
})
</script>

