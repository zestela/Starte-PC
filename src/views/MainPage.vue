<template>
  <div class="mainpage-wrapper">
    <div class="update-tip-bored">
      <div :class="['update-tip', { 'update-tip-checked': hasUpdate }]" id="update-tip">
        <img class="icon-check-update" width="10px" style="margin-right:10px"/>
        <div>现已发布新版本</div>
        <div class="banbenhao">{{ newVersion }}</div>
        <div class="updatebutton" @click="$router.push('/check-new')">点击了解详情</div>
      </div>
    </div>
    <div class="image-info">
      <div :class="textClass" id="mainpage-text">
        <div class="mainpage-title">
          <div id="mainpage-text-title">{{ data?.title || '加载中' }}</div>
          <div class="image-action-icons">
            <button class="onhover" @click="setWallpaper">
              <img style="width:25px;height:25px" class="icon-set-wallpaper"/>
            </button>
            <button class="onhover" @click="doShare">
              <img style="width:25px;height:25px" class="icon-share"/>
            </button>
          </div>
        </div>
        <div id="mainpage-text-describe">{{ data?.describe || '如果你看到了这段话，说明程序正在加载中。' }}</div>
      </div>
      <div class="bottom-line">
        <button class="mainpage-text-disappear" @click="toggleInfo">
          <img :src="infoHidden ? '/expanded.svg' : '/expand.svg'"/>
        </button>
        <div :class="infoClass">
          <img class="icon-date"/>
          <div class="image-date"><span>{{ dateStr }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { apiSafe } from '../utils/api'

const store = useAppStore()
const router = useRouter()

const data = computed(() => store.mainpageData)
const infoHidden = ref(false)
const hasUpdate = ref(false)
const newVersion = ref('')
const bgImage = ref('')
const animationState = ref('visible') // 'visible' | 'disappearing' | 'disappeared' | 'showed'

const dateStr = computed(() => {
  if (!data.value?.date) return 'LOADING......'
  const parts = data.value.date.split('-')
  return `${parts[0]} 年 ${parts[1]} 月 ${parts[2]} 日`
})

const textClass = computed(() => {
  if (animationState.value === 'disappeared') {
    return 'mainpage-text-disappered'
  } else if (animationState.value === 'disappearing') {
    return 'mainpage-text mainpage-text-disappering'
  } else if (animationState.value === 'showed') {
    return 'mainpage-text-showed mainpage-text mainpage-text-showing'
  } else {
    return 'mainpage-text'
  }
})

const infoClass = computed(() => {
  if (animationState.value === 'disappeared') {
    return 'mainpage-text-disappered'
  } else if (animationState.value === 'disappearing') {
    return 'mainpage-text-info mainpage-text-disappering'
  } else if (animationState.value === 'showed') {
    return 'mainpage-text-showed mainpage-text-info mainpage-text-showing'
  } else {
    return 'mainpage-text-info'
  }
})

async function toggleInfo() {
  if (animationState.value === 'visible' || animationState.value === 'showed') {
    // 收起
    await window.electronAPI.setSetting('infoHide', true)
    animationState.value = 'disappearing'
    infoHidden.value = true

    setTimeout(() => {
      animationState.value = 'disappeared'
    }, 500)
  } else {
    // 展开
    await window.electronAPI.setSetting('infoHide', false)
    animationState.value = 'showed'
    infoHidden.value = false
  }
}

function setWallpaper() {
  if (data.value?.id) window.electronAPI.setWallpaper(data.value.id)
}

function doShare() {
  if (data.value?.id) {
    window.electronAPI.share(data.value.id, 0)
    router.push({ name: 'share', query: { id: data.value.id, type: '0' } })
  }
}

async function checkUpdate() {
  const versionOnline = await apiSafe('https://api.zestela.co/banben.json', { cache: 'no-cache' })
  if (!versionOnline) return
  const onlineVer = versionOnline.banben[0].name
  const localVer = await window.electronAPI.getVersion()
  if (onlineVer !== localVer) {
    hasUpdate.value = true
    newVersion.value = onlineVer
  }
}

onMounted(async () => {
  // 加载背景图到组件内部，不污染 body
  if (data.value?.id) {
    const dataUrl = await window.electronAPI.readCacheFile(data.value.id + '.png')
    bgImage.value = `url('${dataUrl}')`
  }

  const hideInfo = await window.electronAPI.getSetting('infoHide')
  if (hideInfo === true) {
    animationState.value = 'disappeared'
    infoHidden.value = true
  }

  checkUpdate()
})
</script>

<style scoped>
.mainpage-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  background-position: center center;
  background-image: v-bind(bgImage);
}

/* 确保 .image-info 相对于 wrapper 定位 */
.mainpage-wrapper .image-info {
  position: absolute;
  left: 20px;
  bottom: 20px;
}
</style>
