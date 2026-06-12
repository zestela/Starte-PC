<template>
  <div id="app-root">
    <Topbar />
    <main class="router-view-container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Topbar from './components/Topbar.vue'
</script>

<style>
/* 确保从 html 到页面内容的高度链不断 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app-root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 导航栏固定高度 */
.topbar {
  flex-shrink: 0;
}

/* 页面内容区域 */
.router-view-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  position: relative;
}

/* 确保页面内容填充容器高度（原始 CSS 依赖 height:100% 级联） */
.router-view-container > :first-child {
  min-height: 100%;
}
</style>
