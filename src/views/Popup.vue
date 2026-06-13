<template>
  <div class="p-[18px] bg-[#181818] h-full select-none">
    <div class="flex flex-col justify-between h-[164px] gap-2">
      <div class="text-white font-bold text-[14px] app-drag">提示</div>
      <div class="flex items-center gap-2 text-[16px] font-semibold text-white/85 overflow-auto" v-html="msg"></div>
      <button class="bg-[#313131] py-2 rounded-[10px] text-white text-[15px] font-semibold text-center cursor-pointer border-none" @click="close">知道了</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const msg = ref('')

async function close() {
  window.electronAPI.popupClose()
}

onMounted(async () => {
  msg.value = await window.electronAPI.getPopupMsg()
})
</script>

<style scoped>
.app-drag {
  -webkit-app-region: drag;
}

:deep(a) {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
}
:deep(a:visited) { color: rgba(255, 255, 255, 0.85); }
:deep(a:hover) { color: rgba(255, 255, 255, 0.85); }
:deep(a:active) { color: rgba(255, 255, 255, 0.85); }

div::-webkit-scrollbar { height: 3.5px; width: 3.5px; }
div::-webkit-scrollbar-corner { background-color: transparent; }
div::-webkit-scrollbar-thumb { border-radius: 10px; background: #ffffff79; }
div::-webkit-scrollbar-track { border-radius: 10px; background: transparent; }
div::-webkit-scrollbar-button { display: none; }
</style>
