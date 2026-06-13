import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const loading = ref(true)
  const loadError = ref(false)
  const mainpageData = ref(null)

  async function init() {
    loading.value = true
    loadError.value = false
    try {
      const result = await window.electronAPI.init()
      if (result && result.ok) {
        mainpageData.value = await window.electronAPI.getMainpageData()
        loading.value = false
      } else {
        throw new Error('init failed')
      }
    } catch (err) {
      console.error('App init error:', err)
      loadError.value = true
    }
  }

  function retry() {
    init()
  }

  return { loading, loadError, mainpageData, init, retry }
})
