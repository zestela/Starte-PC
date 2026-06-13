<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#1B1B1B] py-[60px]">
    <!-- 顶部区域 -->
    <div></div>

    <!-- 中心内容 -->
    <div class="flex flex-col items-center">
      <img class="w-[150px] select-none" src="/text-logo.png"/>

      <div v-if="!store.loadError" class="mt-[60px] text-center">
        <div class="loading-spinner"></div>
        <h3 class="text-white font-semibold text-base mt-3 opacity-80">正在加载数据</h3>
      </div>

      <div v-else class="text-center text-white mt-[30px] max-w-[50vw]">
        <p>加载失败了！您可以尝试如下操作：</p>
        <p>· 检查您的网络连接<br>· 检查您的网络服务是否正确运作<br>· 检查观星记是否在防火墙内</p>
        <p>如以上操作都没有解决您的问题，请<a href="https://zestela.co/support/" target="_blank" class="text-blue-400 hover:underline">点击此处</a>查看解决方案。</p>
        <button class="retry-button" @click="store.retry()">再试一次</button>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="text-center mb-8">
      <p class="text-white font-light text-[11px] opacity-60 mb-2">Beta Edition</p>
      <p class="text-white font-light text-[11px] opacity-60">
        使用即视为同意<a href="https://zestela.co/starte-agreement/" target="_blank" class="text-blue-400 hover:underline">许可协议</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '../stores/app'
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

watch(() => store.loading, (val) => {
  if (!val && route.name === 'loading') router.push('/main')
})
</script>

<style scoped>
/* 加载动画 */
.loading-spinner {
  margin: 0 auto -5px;
  height: 16px;
  width: 16px;
  border: 3px solid transparent;
  border-radius: 100px;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  background-image: linear-gradient(to right, #1B1B1B, #1B1B1B), linear-gradient(-45deg, white, rgba(255, 255, 255, 0));
  animation: turnZ 1.5s linear infinite;
}

@keyframes turnZ {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}

/* 重试按钮 */
.retry-button {
  margin-top: 25px;
  padding: 12px;
  background-color: #3A3A3A;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  color: white;
  font-weight: 600;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: rgb(83, 83, 83);
}

.retry-button:active {
  background-color: rgb(73, 73, 73);
}
</style>
