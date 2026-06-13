<template>
  <div class="w-full h-full overflow-y-auto">
    <div id="wallpaper-list">
      <div v-for="item in items" :key="item.id" class="wallpaper-in-list wallpaper-fade-in"
           :id="item.id" :style="{ backgroundImage: `url(${item.url}),url(/loading-bg.png)` }">
        <!-- 实际内容（移除骨架屏，使用背景图占位） -->
        <div class="wallpaper-content">
          <div class="wallpaper-header">
            <div class="title-and-icons">
              <h1>{{ item.title }}</h1>
              <div class="image-action-icons">
                <button class="onhover special-onhover p-[3.5px]" @click="setWallpaper(item.id)">
                  <IconSetWallpaper />
                </button>
                <button class="onhover special-onhover p-[3.5px]" @click="share(item)">
                  <IconShare />
                </button>
              </div>
            </div>
            <div class="disPLAYDATE">
              <div class="month">{{ item.month }}</div>
              <div class="fenge"> / </div>
              <div class="dayte">{{ item.day }}</div>
            </div>
          </div>
          <h3>{{ item.describe }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../utils/api'
import { IconSetWallpaper, IconShare } from '../components/icons'
import { useToast } from '../composables/useToast'

const router = useRouter()
const route = useRoute()
const items = ref([])
const { success, error } = useToast()

function scrollToItem(id) {
  if (!id) return
  nextTick(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function setWallpaper(id) {
  const result = await window.electronAPI.setWallpaper(id)
  if (result?.success) {
    success('壁纸设置成功')
  } else {
    error('壁纸设置失败')
  }
}

async function share(item) {
  try {
    // 等待图片下载完成
    const result = await window.electronAPI.share(item.id, 0)

    if (!result.success) {
      window.electronAPI.outAlert('图片加载失败，请重试')
      return
    }

    // 下载成功后跳转，传递完整数据
    router.push({
      name: 'share',
      query: {
        id: item.id,
        title: item.title,
        describe: item.describe
      }
    })
  } catch (err) {
    console.error('分享失败:', err)
    window.electronAPI.outAlert('分享失败，请重试')
  }
}

onMounted(async () => {
  try {
    const data = await api('https://api.zestela.co/new-mainpage/get-mainpage-history-list.php')
    items.value = Object.values(data.data).reverse().map(it => {
      const d = new Date(it.date)
      return { ...it, month: d.getMonth()+1, day: d.getDate() }
    })
    scrollToItem(route.query.scrollTo)
  } catch (e) { console.error(e) }
})
</script>

<style scoped>
 .wallpaper-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 35px 35px 25px;
}

/* 简单的淡入动画 - 依赖浏览器原生图片加载 */
.wallpaper-fade-in {
  animation: fadeInBackground 0.6s ease-out;
}

@keyframes fadeInBackground {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.wallpaper-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.title-and-icons {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.wallpaper-content h1 {
  margin: 0;
  font-weight: 600;
  font-size: 45px;
  text-shadow: 0px 0px 20px rgba(0, 0, 0, 0.7);
}

.wallpaper-content h3 {
  margin: 7px 0 0 0;
  font-weight: lighter;
  color: rgba(255, 255, 255, 0.662);
  text-shadow: 0px 0px 20px rgba(0, 0, 0, 0.7);
}
</style>
