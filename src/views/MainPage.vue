<template>
  <div>
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
          <div class="image-date"><date>{{ dateStr }}</date></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()

const data = computed(() => store.mainpageData)
const infoHidden = ref(false)
const hasUpdate = ref(false)
const newVersion = ref('')

// 修复背景图（通过 watch）
const setBodyBg = async () => {
  if (!data.value?.id) return
  const appdata = await window.electronAPI.getappdata()
  document.body.style.backgroundImage = `url('${appdata}/starte-cache/${data.value.id}.png')`
}

const dateStr = computed(() => {
  if (!data.value?.date) return 'LOADING......'
  const parts = data.value.date.split('-')
  return `${parts[0]} 年 ${parts[1]} 月 ${parts[2]} 日`
})

const textClass = computed(() => ({
  'mainpage-text': true,
  'mainpage-text-disappered': infoHidden.value
}))

const infoClass = computed(() => ({
  'mainpage-text-info': true,
  'mainpage-text-disappered': infoHidden.value
}))

async function toggleInfo() {
  infoHidden.value = !infoHidden.value
  await window.electronAPI.setSetting('infoHide', infoHidden.value)
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
  try {
    const res = await fetch('https://api.zestela.co/banben.json', { cache: 'no-cache' })
    const versionOnline = await res.json()
    const onlineVer = versionOnline.banben[0].name
    const localVer = await window.electronAPI.getVersion()
    if (onlineVer !== localVer) {
      hasUpdate.value = true
      newVersion.value = onlineVer
    }
  } catch (e) { /* ignore */ }
}

onMounted(async () => {
  // store.mainpageData 已在 init 阶段填充
  if (data.value) setBodyBg()
  
  const hideInfo = await window.electronAPI.getSetting('infoHide')
  infoHidden.value = (hideInfo == true)

  checkUpdate()
})
</script>
