<template>
  <div class="setting-contain">
    <div class="setting-left">
      <div class="setting-nav" :style="{ backgroundColor: tab === 'settings' ? '#454545' : '' }" @click="tab = 'settings'">
        <IconSettingsNormal />
        <div class="setting-nav-text"><div class="setting-nav-text-title">功能</div></div>
      </div>
      <div class="setting-nav" style="margin-top:16px" :style="{ backgroundColor: tab === 'about' ? '#454545' : '' }" @click="tab = 'about'">
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
            <label class="button-label labelClicked" style="cursor:default">
              <span class="circle circle-not-click circleClicked"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于 Tab -->
    <div v-else class="setting-right" style="display:flex;justify-content:center;align-items:center;flex-direction:column">
      <div class="about-container">
        <div class="starte-logo">
          <div style="margin-left:30px">
            <img style="height:30px" src="/text-logo.png"/>
            <div style="margin-top:5px;font-size:13px;color:rgba(255,255,255,0.436)">{{ version }}</div>
          </div>
          <img style="height:70px;margin-right:30px" src="/color-logo.png"/>
        </div>
        <div class="buttons">
          <div class="right-icons" style="border-radius:0 12px 12px 0;cursor:pointer" @click="$router.push('/check-new')">
            <div><IconUpdate /><div class="setting-nav-text-title">检查更新</div></div>
          </div>
        </div>
        <a href="https://github.com/zestela" class="links" style="border-radius:12px 0 0 12px" target="_blank">
          <IconGithub /><div style="margin-left:10px"><div class="setting-nav-text-title">GitHub</div><div class="setting-nav-text-context">开源主页</div></div>
        </a>
        <a href="https://zestela.co/starte" class="links" target="_blank">
          <IconWebsite /><div style="margin-left:10px"><div class="setting-nav-text-title">官网</div><div class="setting-nav-text-context">了解更多</div></div>
        </a>
        <a @click="$router.push('/donate')" class="links" style="border-radius:0 12px 12px 0;cursor:pointer">
          <IconGroup /><div style="margin-left:10px"><div class="setting-nav-text-title">赞助者</div><div class="setting-nav-text-context">感谢支持</div></div>
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
