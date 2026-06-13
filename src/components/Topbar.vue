<template>
  <div class="topbar" id="topbar">
    <div class="topbar-menu">
      <IconLogo :size="18" class="topbar-logo cursor-pointer" @click="$router.push('/main')"/>
      <button :class="menuClass('main')" @click="$router.push('/main')">
        <IconToday :size="15" class="today-icon h-[15px]"/>
      </button>
      <button :class="menuClass('vicissitudes')" @click="$router.push('/vicissitudes')">
        <h5 class="menu-text">沧溟</h5>
      </button>
      <button :class="menuClass('wallpaper-list')" @click="$router.push('/wallpaper-list')">
        <h5 class="menu-text">往日</h5>
      </button>
      <button :class="menuClass('star-watching')" @click="$router.push('/star-watching')">
        <h5 class="menu-text">观星</h5>
      </button>
    </div>
    <div class="topbar-icons-all">
      <div class="topbar-icons">
        <button :class="iconClass('submission')" @click="$router.push('/submission')">
          <IconAdd :size="14.6" class="add-icon"/>
        </button>
        <button class="onhover" @click="$router.push('/search')">
          <IconSearch :size="14.6" />
        </button>
        <button class="onhover" @click="$router.push('/settings')">
          <IconSettings :size="14.6" class="add-icon"/>
        </button>
        <button class="onhover" @click="handleWindowEvent(1)">
          <IconMin :size="14.6" />
        </button>
        <button class="onhover" @click="handleWindowEvent(2)">
          <IconMax :size="14.6" />
        </button>
        <button class="onhover closeonhover" @click="handleWindowEvent(3)">
          <IconClose :size="14.6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { IconLogo, IconToday, IconAdd, IconSearch, IconSettings, IconMin, IconMax, IconClose } from '../components/icons'

const route = useRoute()

const menuPages = ['main', 'vicissitudes', 'wallpaper-list', 'star-watching']

function menuClass(page) {
  const isChosen = route.name === page
  if (page === 'main') {
    // today 按钮：基础样式 + 特殊 padding + 选中状态
    return {
      'menu-item': true,
      'menu-item-today-img': true,
      'menu-item-chosen': isChosen
    }
  }
  // 其他按钮：默认 menu-item + 选中时加 menu-item-chosen
  return {
    'menu-item': true,
    'menu-item-chosen': isChosen
  }
}

function iconClass(page) {
  return {
    'onhover': true,
    'add-icon-onhover': page === 'submission',
    'add-icon-onhover-chosen': route.name === page
  }
}

function handleWindowEvent(type) {
  window.electronAPI.windowEvents(type)
}
</script>
