<template>
  <div id="app-root">
    <Topbar />
    <main class="router-view-container">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <!-- 全局 Toast -->
    <Toast :key="toastKey" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import Topbar from './components/Topbar.vue'
import Toast from './components/Toast.vue'
import { useToast } from './composables/useToast'

const { toastMessage, toastType, toastKey } = useToast()
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
  overflow: hidden;
  position: relative;
}

/* 确保页面内容填充容器高度（原始 CSS 依赖 height:100% 级联） */
.router-view-container > :first-child {
  min-height: 100%;
}

/* 页面过渡动画 - 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 页面过渡动画 - 滑动 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 缩放过渡 */
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.03);
}
</style>
