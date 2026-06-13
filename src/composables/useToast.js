import { ref } from 'vue'

// 全局 Toast 状态
const toastMessage = ref('')
const toastType = ref('success')
const toastKey = ref(0)

export function useToast() {
  function showToast(message, type = 'success') {
    toastMessage.value = message
    toastType.value = type
    toastKey.value++ // 触发重新渲染
  }

  function success(message) {
    showToast(message, 'success')
  }

  function error(message) {
    showToast(message, 'error')
  }

  function info(message) {
    showToast(message, 'info')
  }

  return {
    toastMessage,
    toastType,
    toastKey,
    showToast,
    success,
    error,
    info
  }
}
