<template>
  <div class="setting-contain">
    <div class="setting-left">
      <div class="setting-nav" @click="$router.push('/settings')">
        <IconSettingsNormal />
        <div class="setting-nav-text"><div class="setting-nav-text-title">功能</div></div>
      </div>
      <div class="setting-nav" style="margin-top:16px" @click="$router.push('/settings?tab=about')">
        <IconSettingsAbout />
        <div class="setting-nav-text"><div class="setting-nav-text-title">关于</div></div>
      </div>
    </div>
    <div class="setting-right" style="display:flex;justify-content:center;align-items:center">
      <div class="vwo50-container">
        <div class="vwo50">
          <div style="font-weight:600;font-size:30px">赞助者鸣谢</div>
          <div id="vwo50-users">
            <div class="vwo50-user" v-for="s in sponsors" :key="s.name">
              <img :src="s.avatar"/>
              <div>{{ s.name }}</div>
            </div>
            <div v-if="!sponsors.length" style="color:#888;padding:20px">加载中...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../utils/api'
import { IconSettingsNormal, IconSettingsAbout } from '../components/icons'
import { ref, onMounted } from 'vue'
import { apiSafe } from '../utils/api'

const sponsors = ref([])

onMounted(async () => {
  try {
    const data = await apiSafe('https://afdian.com/api/creator/get-sponsors?user_id=77c84822f38311eb8e3052540025c377&type=new&page=1')
    if (data) sponsors.value = data.data.list.map(s => ({ name: s.name, avatar: s.avatar }))
  } catch (e) { console.error('donate error:', e) }
})
</script>
