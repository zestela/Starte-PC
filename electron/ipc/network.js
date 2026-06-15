const { ipcMain } = require('electron');
const https = require('https');
const { URL } = require('url');

/**
 * 统一 API 代理类 IPC（安全边界）
 *
 * 独立成文件便于安全审计：域名白名单逻辑集中于此。
 * 前端的所有出站 HTTP 请求必须经此通道，避免暴露 CORS 与绕过白名单的风险。
 *
 * 使用 Node.js 原生 https.request 替代 fetch()，避免 multipart 上传
 * 和 AbortSignal 在 Electron 主进程中的兼容性问题。
 */
function register() {
  ipcMain.handle('api-fetch', async (event, url, options) => {
    const allowed = ['api.zestela.co', 'afdian.com'];
    let parsed;
    try {
      parsed = new URL(url);
      if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
        throw new Error(`Blocked domain: ${parsed.hostname}`);
      }
    } catch (e) {
      if (e.message.startsWith('Blocked domain:')) throw e;
      throw new Error(`Invalid URL: ${url}`);
    }

    const timeout = options?.timeout || 15000;
    const method = options?.method || 'GET';

    // --- multipart 文件上传（投稿专用）---
    if (options?._multipartBase64) {
      const boundary = '----StarteBoundary' + Math.random().toString(36).slice(2);
      const fileBuffer = Buffer.from(options._fileBase64, 'base64');
      const fileName = (options._fileName || 'upload').replace(/[^\u0020-\u007e]/g, '_');
      const fileType = options._fileType || 'application/octet-stream';
      const sendMessage = options._sendMessage || '';

      // 构造 multipart body — 字段名与后端 PHP 代码保持一致
      const headerPart = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
        `Content-Type: ${fileType}\r\n` +
        `Content-Transfer-Encoding: binary\r\n\r\n`
      );
      const middlePart = Buffer.from(
        `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="SendMessage"\r\n\r\n`
      );
      const messagePart = Buffer.from(sendMessage);
      const endPart = Buffer.from(`\r\n--${boundary}--\r\n`);

      const bodyBuffer = Buffer.concat([headerPart, fileBuffer, middlePart, messagePart, endPart]);

      return new Promise((resolve, reject) => {
        const req = https.request({
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length,
            'User-Agent': 'Starte-App',
            'Accept': 'application/json, text/plain, */*'
          },
          timeout: timeout
        }, (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            // 尝试解析为 JSON
            const trimmed = data.trim();
            // 先尝试从响应中提取 JSON（PHP 有时会在 JSON 前后输出警告信息）
            const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                resolve(JSON.parse(jsonMatch[0]));
                return;
              } catch (e) {
                // fall through
              }
            }
            // 直接解析
            try {
              resolve(JSON.parse(trimmed));
              return;
            } catch (parseErr) {
              // 服务器返回的不是 JSON（PHP 错误页面）
              // 从 HTML 中提取可读的错误信息
              const plainText = trimmed
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              const preview = plainText.substring(0, 300);
              reject(new Error(`服务器返回错误 (HTTP ${res.statusCode})：${preview || '未知响应'}`));
            }
          });
        });

        req.on('error', (e) => reject(new Error(`网络错误：${e.message}`)));
        req.on('timeout', () => {
          req.destroy(new Error('请求超时，请检查网络连接后重试'));
        });

        req.write(bodyBuffer);
        req.end();
      });
    }

    // --- 普通请求 ---
    let bodyBuffer = null;
    const headers = options._headers ? { ...options._headers } : {};

    if (options?._bodyBase64) {
      bodyBuffer = Buffer.from(options._bodyBase64, 'base64');
      if (!headers['Content-Length']) headers['Content-Length'] = bodyBuffer.length;
    } else if (options?.body && typeof options.body === 'string') {
      bodyBuffer = Buffer.from(options.body);
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
      if (!headers['Content-Length']) headers['Content-Length'] = bodyBuffer.length;
    }

    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: method,
        headers: Object.keys(headers).length ? headers : undefined,
        timeout: timeout
      }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            }
          } catch (parseErr) {
            reject(new Error(`Parse error: ${parseErr.message}`));
          }
        });
      });

      req.on('error', (e) => reject(new Error(`Request error: ${e.message}`)));
      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });

      if (bodyBuffer) req.write(bodyBuffer);
      req.end();
    });
  });
}

module.exports = register;
