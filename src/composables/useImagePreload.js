import { ref, onMounted } from 'vue'

/**
 * 图片预加载 Hook
 * 返回加载状态，在图片加载完成前显示占位符
 */
export function useImagePreload(imageUrl) {
  const loaded = ref(false)
  const error = ref(false)

  onMounted(() => {
    if (!imageUrl) {
      loaded.value = true
      return
    }

    const img = new Image()
    img.onload = () => {
      loaded.value = true
    }
    img.onerror = () => {
      error.value = true
      loaded.value = true // 即使失败也标记为已加载，显示占位符
    }
    img.src = imageUrl
  })

  return { loaded, error }
}

/**
 * 批量图片预加载
 * 适用于列表页面
 */
export function useBatchImagePreload(imageUrls) {
  const loadedCount = ref(0)
  const totalCount = ref(imageUrls.length)
  const allLoaded = ref(false)

  onMounted(() => {
    if (!imageUrls.length) {
      allLoaded.value = true
      return
    }

    let count = 0
    imageUrls.forEach(url => {
      const img = new Image()
      img.onload = img.onerror = () => {
        count++
        loadedCount.value = count
        if (count === imageUrls.length) {
          allLoaded.value = true
        }
      }
      img.src = url
    })
  })

  return { loadedCount, totalCount, allLoaded }
}
