import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(true)
  const loadError = ref(false)
  const mainpageData = ref(null)
  // 主页图片下载结果 Promise：供 MainPage 在读缓存前等待，避免图片未就绪时的无意义重试
  const imageReady = ref(Promise.resolve({ success: false }))

  async function init() {
    loading.value = true
    loadError.value = false
    try {
      // bootstrap 拉取主页数据（必须成功），直接返回 data
      const data = await window.electronAPI.bootstrap()
      mainpageData.value = data
      loading.value = false

      // 以下两步失败不影响启动，后台静默执行
      // ensureMainpageImage 供主页背景图读取；applyStartupWallpaper 内部会再次确保图片就绪
      imageReady.value = window.electronAPI.ensureMainpageImage(data).catch(err => {
        console.warn('主页图片下载失败，主页将无背景图:', err)
        return { success: false }
      })
      window.electronAPI.applyStartupWallpaper(data).catch(err => {
        console.warn('开机壁纸设置失败:', err)
      })
    } catch (err) {
      console.error('App init error:', err)
      loadError.value = true
      loading.value = false
    }
  }

  function retry() {
    init()
  }

  return { loading, loadError, mainpageData, imageReady, init, retry }
})
