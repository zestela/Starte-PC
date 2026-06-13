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
            <h3 class="text-[15px] font-medium text-white mb-2">关闭时自动收起到系统托盘菜单</h3>
            <p class="text-[13px] text-white/50">默认开启，暂时无法关闭</p>
          </div>
          <div class="ml-6">
            <button
              disabled
              class="relative w-12 h-6 rounded-full bg-[#5D55FF] opacity-50 cursor-not-allowed"
            >
              <span class="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full"></span>
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
            href="https://zestela.co/starte"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IconSettingsNormal, IconSettingsAbout, IconUpdate, IconGithub, IconWebsite, IconGroup } from '../components/icons'
import { api } from '../utils/api'

const route = useRoute()
const tab = ref(route.query.tab === 'about' ? 'about' : 'settings')
const autoStart = ref(false)
const version = ref('')

// 检查更新相关状态
const statusText = ref('正在检查更新……')
const hasUpdate = ref(false)
const newVersion = ref('')
const newDate = ref('')
const updateWeb = ref('')
const downloadLink = ref('')
const copyText = ref('复制链接')
let localVersion = ''

async function toggleAutoStart() {
  autoStart.value = !autoStart.value
  await window.electronAPI.setSetting('isSelfopen', autoStart.value)
}

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

// 监听 tab 切换，进入检查更新 tab 时自动检查
watch(tab, (newTab) => {
  if (newTab === 'update' && statusText.value === '正在检查更新……') {
    checkUpdate()
  }
})

onMounted(async () => {
  autoStart.value = (await window.electronAPI.getSetting('isSelfopen')) == true
  version.value = await window.electronAPI.getVersion()
  localVersion = version.value

  // 如果直接导航到检查更新页面
  if (tab.value === 'update') {
    checkUpdate()
  }
})
</script>

