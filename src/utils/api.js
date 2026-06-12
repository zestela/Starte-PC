/**
 * API 请求封装 —— 全部走后端（Electron 主进程），避免前端 CORS
 */
export async function api(url, options = {}) {
  const data = await window.electronAPI.apiFetch(url, options)
  return data
}

/** 静默版本 —— 失败返回 null */
export async function apiSafe(url, options = {}) {
  try {
    return await api(url, options)
  } catch {
    return null
  }
}
