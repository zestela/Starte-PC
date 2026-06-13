<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
    <div class="flex justify-center items-center">
      <img class="w-[150px] select-none" src="/text-logo.png"/>
    </div>
    <div v-if="!store.loadError" class="mt-[60px] text-center">
      <div class="loading"></div>
      <h3 class="text-connecting">正在加载数据</h3>
      <h3 class="text-dev">Beta Edition</h3>
      <h3 class="text-dev -mt-2.5">使用即视为同意<a href="https://zestela.co/starte-agreement/" target="_blank" class="text-blue-400 hover:underline">许可协议</a></h3>
    </div>
    <div v-else class="text-center text-white mt-[30px] max-w-[50vw]">
      <p>加载失败了！您可以尝试如下操作：</p>
      <p>· 检查您的网络连接<br>· 检查您的网络服务是否正确运作<br>· 检查观星记是否在防火墙内</p>
      <p>如以上操作都没有解决您的问题，请<a href="https://zestela.co/support/" target="_blank" class="text-blue-400 hover:underline">点击此处</a>查看解决方案。</p>
      <button class="timeout-retry-button" @click="store.retry()">再试一次</button>
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
/* 保留动画相关样式 */
.loading {
  /* 从 loading.css 继承 */
}

.text-connecting {
  /* 从 loading.css 继承 */
}

.text-dev {
  /* 从 loading.css 继承 */
}

.timeout-retry-button {
  /* 从 loading.css 继承 */
}
</style>
