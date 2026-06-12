<template>
  <div class="topbar" id="topbar">
    <div class="topbar-menu">
      <img class="topbar-logo icon-logo" style="cursor:pointer" @click="$router.push('/main')"/>
      <button :class="menuClass('main')" @click="$router.push('/main')">
        <img class="today-icon icon-today"/>
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
          <img class="add-icon icon-add"/>
        </button>
        <button class="onhover" @click="$router.push('/search')">
          <img class="icon-search"/>
        </button>
        <button class="onhover" @click="$router.push('/settings')">
          <img class="add-icon icon-settings"/>
        </button>
        <button class="onhover" @click="handleWindowEvent(1)">
          <img class="icon-min"/>
        </button>
        <button class="onhover" @click="handleWindowEvent(2)">
          <img class="icon-max"/>
        </button>
        <button class="onhover closeonhover" @click="handleWindowEvent(3)">
          <img class="icon-close"/>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

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
