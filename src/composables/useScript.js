/**
 * 动态加载外部脚本的组合式函数
 * @param {string} src - 脚本 URL
 * @param {Object} options - 配置选项
 * @param {Function} options.onError - 加载失败回调
 * @param {Function} options.check - 检查脚本是否已加载的函数
 * @returns {Promise<void>}
 */
export function useScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    // 如果脚本已加载，直接返回
    if (options.check && options.check()) {
      return resolve()
    }

    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => {
      if (options.onError) options.onError()
      reject(new Error(`Failed to load script: ${src}`))
    }

    document.head.appendChild(script)
  })
}
