<template>
  <div class="loading-overlay">
    <div class="flex-logo">
      <img style="width:150px;user-select:none" src="/text-logo.png"/>
    </div>
    <div v-if="!store.loadError" class="loading-bottom" style="position:static;margin-top:60px">
      <div class="loading"></div>
      <h3 class="text-connecting">正在加载数据</h3>
      <h3 class="text-dev">Beta Edition</h3>
      <h3 class="text-dev" style="margin-top:-10px">使用即视为同意<a href="https://zestela.co/starte-agreement/" target="_blank">许可协议</a></h3>
    </div>
    <div v-else style="text-align:center;color:white;margin-top:30px;max-width:50vw">
      <p>加载失败了！您可以尝试如下操作：</p>
      <p>· 检查您的网络连接<br>· 检查您的网络服务是否正确运作<br>· 检查观星记是否在防火墙内</p>
      <p>如以上操作都没有解决您的问题，请<a href="https://zestela.co/support/" target="_blank">点击此处</a>查看解决方案。</p>
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
.loading-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: black;
}
</style>
