<template>
  <div class="w-full h-full flex overflow-hidden bg-black text-white pt-[45px]">
    <!-- 左侧导航 -->
    <div class="w-1/5 h-full bg-black flex flex-col p-4">
      <button
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[#2a2a2a]"
        @click="$router.push('/settings')"
      >
        <IconSettingsNormal :size="20"/>
        <span class="text-[15px] font-medium">功能</span>
      </button>
      <button
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 hover:bg-[#2a2a2a]"
        @click="$router.push('/settings?tab=about')"
      >
        <IconSettingsAbout :size="20"/>
        <span class="text-[15px] font-medium">关于</span>
      </button>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 h-full flex flex-col items-center justify-center px-8">
      <div class="w-[70%] max-w-3xl">
        <div class="font-semibold text-[30px]">赞助者鸣谢</div>
        <div class="grid grid-cols-4 gap-3.5 mt-4">
          <div
            v-for="s in sponsors"
            :key="s.name"
            class="flex items-center gap-2 py-3 px-1"
          >
            <img :src="s.avatar" class="w-[25px] h-[25px] rounded-full"/>
            <div class="font-normal text-white/75 text-[15px] truncate">{{ s.name }}</div>
          </div>
          <div v-if="!sponsors.length" class="text-gray-500 p-5 col-span-4">加载中...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'
import { IconSettingsNormal, IconSettingsAbout } from '../components/icons'

const sponsors = ref([])

onMounted(async () => {
  try {
    const data = await api('https://afdian.com/api/creator/get-sponsors?user_id=77c84822f38311eb8e3052540025c377&type=new&page=1')
    if (data) sponsors.value = data.data.list.map(s => ({ name: s.name, avatar: s.avatar }))
  } catch (e) { console.error('donate error:', e) }
})
</script>
