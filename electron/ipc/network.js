const { ipcMain } = require('electron');

/**
 * 统一 API 代理类 IPC（安全边界）
 *
 * 独立成文件便于安全审计：域名白名单逻辑集中于此。
 * 前端的所有出站 HTTP 请求必须经此通道，避免暴露 CORS 与绕过白名单的风险。
 */
function register() {
  ipcMain.handle('api-fetch', async (event, url, options) => {
    const allowed = ['api.zestela.co', 'afdian.com'];
    try {
      const parsed = new URL(url);
      if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
        throw new Error(`Blocked domain: ${parsed.hostname}`);
      }
    } catch (e) {
      if (e.message.startsWith('Blocked domain:')) throw e;
      throw new Error(`Invalid URL: ${url}`);
    }

    const timeout = options?.timeout || 15000;
    const fetchOptions = { ...options, signal: AbortSignal.timeout(timeout) };
    delete fetchOptions.timeout;

    // 恢复 FormData
    if (fetchOptions._bodyBase64) {
      fetchOptions.body = Buffer.from(fetchOptions._bodyBase64, 'base64');
      delete fetchOptions._bodyBase64;
    }
    if (fetchOptions._headers) {
      fetchOptions.headers = fetchOptions._headers;
      delete fetchOptions._headers;
    }

    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  });
}

module.exports = register;
