/**
 * fetch 封装 —— 行为对齐 axios：非 2xx 自动抛异常，超时支持，JSON 自动解析
 */
export async function api(url, options = {}) {
  const { timeout = 15000, ...fetchOptions } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
    })

    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    return await res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw err
  }
}

/** 静默版本 —— 失败返回 null 不抛异常 */
export async function apiSafe(url, options = {}) {
  try {
    return await api(url, options)
  } catch {
    return null
  }
}
