const registerBootstrap = require('./bootstrap');
const registerWindow = require('./window');
const registerSettings = require('./settings');
const registerMedia = require('./media');
const registerNetwork = require('./network');
const registerSystem = require('./system');
const { register: registerUpdate, setMainWindow } = require('./update');

/**
 * 聚合注册所有 IPC handlers
 *
 * 按功能领域分组：
 *   bootstrap 启动 / window 窗口弹窗 / settings 设置 / media 图片 / network 安全代理 / system 系统信息 / update 更新
 */
function registerIpc() {
  registerBootstrap();
  registerWindow();
  registerSettings();
  registerMedia();
  registerNetwork();
  registerSystem();
  registerUpdate();
}

module.exports = { registerIpc, setMainWindow };
