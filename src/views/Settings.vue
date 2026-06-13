<template>
  <div class="setting-contain">
    <div class="setting-left">
      <div class="setting-nav" :class="{ 'bg-[#454545]': tab === 'settings' }" @click="tab = 'settings'">
        <IconSettingsNormal />
        <div class="setting-nav-text"><div class="setting-nav-text-title">功能</div></div>
      </div>
      <div class="setting-nav mt-4" :class="{ 'bg-[#454545]': tab === 'about' }" @click="tab = 'about'">
        <IconSettingsAbout />
        <div class="setting-nav-text"><div class="setting-nav-text-title">关于</div></div>
      </div>
    </div>

    <!-- 功能 Tab -->
    <div v-if="tab === 'settings'" class="setting-right">
      <div class="setting-item">
        <div>
          <div class="setting-nav-text-title">开机开启观星记自动将更新的 Today 图片设置为桌面壁纸</div>
          <div class="setting-nav-text-context">开启后，在系统设置 / 第三方软件中关闭开机自启动无效，须在此处关闭才可生效</div>
        </div>
        <div class="setting-switch">
          <div class="switch-container">
            <label :class="['button-label', { labelClicked: autoStart }]" @click="toggleAutoStart">
              <span :class="['circle', { circleClicked: autoStart }]"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="setting-item">
        <div>
          <div class="setting-nav-text-title">关闭时自动收起到系统托盘菜单</div>
          <div class="setting-nav-text-context">默认开启，暂时无法关闭</div>
        </div>
        <div class="setting-switch">
          <div class="switch-container">
            <label class="button-label labelClicked cursor-default">
              <span class="circle circle-not-click circleClicked"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于 Tab -->
    <div v-else class="setting-right flex justify-center items-center flex-col">
      <div class="about-container">
        <div class="starte-logo">
          <div class="ml-[30px]">
            <img class="h-[30px]" src="/text-logo.png"/>
            <div class="mt-[5px] text-[13px] text-white/40">{{ version }}</div>
          </div>
          <img class="h-[70px] mr-[30px]" src="/color-logo.png"/>
        </div>
        <div class="buttons">
          <div class="right-icons rounded-r-xl cursor-pointer" @click="$router.push('/check-new')">
            <div><IconUpdate /><div class="setting-nav-text-title">检查更新</div></div>
          </div>
        </div>
        <a href="https://github.com/zestela" class="links rounded-l-xl" target="_blank">
          <IconGithub /><div class="ml-2.5"><div class="setting-nav-text-title">GitHub</div><div class="setting-nav-text-context">开源主页</div></div>
        </a>
        <a href="https://zestela.co/starte" class="links" target="_blank">
          <IconWebsite /><div class="ml-2.5"><div class="setting-nav-text-title">官网</div><div class="setting-nav-text-context">了解更多</div></div>
        </a>
        <a @click="$router.push('/donate')" class="links rounded-r-xl cursor-pointer">
          <IconGroup /><div class="ml-2.5"><div class="setting-nav-text-title">赞助者</div><div class="setting-nav-text-context">感谢支持</div></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IconSettingsNormal, IconSettingsAbout, IconUpdate, IconGithub, IconWebsite, IconGroup } from '../components/icons'

const route = useRoute()
const tab = ref(route.query.tab === 'about' ? 'about' : 'settings')
const autoStart = ref(false)
const version = ref('')

async function toggleAutoStart() {
  autoStart.value = !autoStart.value
  await window.electronAPI.setSetting('isSelfopen', autoStart.value)
}

onMounted(async () => {
  autoStart.value = (await window.electronAPI.getSetting('isSelfopen')) == true
  version.value = await window.electronAPI.getVersion()
})
</script>

<style scoped>
.setting-contain {
  background-color: transparent;
  min-height: 100%;
}
</style>
