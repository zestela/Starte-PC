<template>
  <div class="mainpage-wrapper">
    <div
      v-if="hasUpdate"
      class="fixed top-[55px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 h-10 px-[27px] bg-black/37 text-white/70 text-[14px] font-semibold border border-white/20 rounded-full backdrop-blur-[98px]"
    >
      <IconCheckUpdate class="w-[10px]"/>
      <span>现已发布新版本</span>
      <span>{{ newVersion }}</span>
      <span class="text-white font-bold ml-2.5 cursor-pointer hover:underline" @click="$router.push('/check-new')">点击了解详情</span>
    </div>
    <div class="image-info">
      <div :class="textClass" id="mainpage-text">
        <div class="mainpage-title">
          <div id="mainpage-text-title">{{ data?.title || '加载中' }}</div>
          <div class="image-action-icons">
            <button class="onhover" @click="setWallpaper">
              <IconSetWallpaper class="w-[25px] h-[25px]"/>
            </button>
            <button class="onhover" @click="doShare">
              <IconShare class="w-[25px] h-[25px]"/>
            </button>
          </div>
        </div>
        <div id="mainpage-text-describe">{{ data?.describe || '如果你看到了这段话，说明程序正在加载中。' }}</div>
      </div>
      <div class="bottom-line">
        <button class="mainpage-text-disappear" @click="toggleInfo">
          <img :src="infoHidden ? expandedIcon : expandIcon"/>
        </button>
        <div :class="infoClass">
          <IconDate />
          <div class="image-date"><span>{{ dateStr }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { IconCheckUpdate, IconSetWallpaper, IconShare, IconDate } from '../components/icons'
import expandIcon from '../icons/expand.svg'
import expandedIcon from '../icons/expanded.svg'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { apiSafe } from '../utils/api'
import { useToast } from '../composables/useToast'

const store = useAppStore()
const router = useRouter()
const { success, error } = useToast()

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

function animationClass(baseClass) {
  const state = animationState.value
  const modifiers = {
    disappeared: `${baseClass}-disappeared`,
    disappearing: `${baseClass} ${baseClass}-disappearing`,
    showed: `${baseClass}-showed ${baseClass} ${baseClass}-showing`
  }
  return modifiers[state] || baseClass
}

const textClass = computed(() => animationClass('mainpage-text'))
const infoClass = computed(() => animationClass('mainpage-text-info'))

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

async function setWallpaper() {
  if (data.value?.id) {
    const result = await window.electronAPI.setWallpaper(data.value.id)
    if (result?.success) {
      success('壁纸设置成功')
    } else {
      error('壁纸设置失败')
    }
  }
}

async function doShare() {
  if (data.value?.id) {
    const result = await window.electronAPI.share(data.value.id)

    if (!result.success) {
      error('分享失败，请重试')
      return
    }

    router.push({
      name: 'share',
      query: {
        id: data.value.id,
        title: data.value.title,
        describe: data.value.describe
      }
    })
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

// 加载背景图：先等图片下载完成（store.imageReady），再读缓存；下载失败则直接放弃，不重试
async function loadBgImage() {
  if (!data.value?.id) return
  const filename = data.value.id + '.png'

  // 等待图片下载完成；失败则主页无背景图（不再重试）
  const result = await store.imageReady
  if (!result?.success) {
    console.warn('主页图片未就绪，主页将无背景图')
    return
  }

  try {
    const dataUrl = await window.electronAPI.readCacheFile(filename)
    bgImage.value = `url('${dataUrl}')`
  } catch (e) {
    console.warn('背景图读取失败:', e)
  }
}

onMounted(async () => {
  loadBgImage()  // 后台加载，不阻塞设置读取与更新检查

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
