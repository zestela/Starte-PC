<template>
  <div id="app-root">
    <Topbar />
    <div class="router-view-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Topbar from './components/Topbar.vue'
</script>

<style>
#app-root {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.router-view-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
