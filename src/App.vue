<template>
  <div id="app-root">
    <Topbar />
    <router-view />
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
  overflow: hidden;
}
</style>
