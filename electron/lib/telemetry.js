const os = require('os');
const state = require('./state');
const { reportError } = require('./error-popup');

/**
 * 发送遥测数据到服务器
 */
async function infoToServer() {
  const errorMsg = "遥测模块出现错误。向<a href='https://zestela.co/support/' target='_blank'>此处</a>反馈<br>错误信息：";

  try {
    const { publicIpv4 } = await import('public-ip');
    const myIp = await publicIpv4({ timeout: 20000 });
    const deviceId = require("node-machine-id").machineIdSync({ original: true });
    const params = new URLSearchParams({
      getip: myIp,
      getuseTime: Math.round(Date.now() / 1000),
      getdeviceId: deviceId,
      getuseSystem: os.release(),
      getuseVersion: state.APP_VERSION
    }).toString();
    const url = `https://api.zestela.co/info/analysis.php?${params}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const raw = await response.text();
    const text = raw.trim();
    if (!text.startsWith('{') && !text.startsWith('[')) {
      console.error('[Starte] 遥测服务器返回非 JSON 内容:', raw.slice(0, 200));
      reportError(errorMsg + '服务器返回异常内容');
      return;
    }
    const result = JSON.parse(text);
    if (result.code !== 1) reportError(errorMsg + result.msg);
  } catch (error) {
    console.error('[Starte] 遥测模块错误:', error);
    reportError(errorMsg + error.message);
  }
}

module.exports = { infoToServer };
