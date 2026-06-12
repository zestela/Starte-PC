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
        <button class="onhover" @click="window.electronAPI.windowEvents(1)">
          <img class="icon-min"/>
        </button>
        <button class="onhover" @click="window.electronAPI.windowEvents(2)">
          <img class="icon-max"/>
        </button>
        <button class="onhover closeonhover" @click="window.electronAPI.windowEvents(3)">
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
  return {
    'menu-item': page !== 'main',
    'menu-item-today-img': page === 'main',
    'menu-item-chosen': route.name === page
  }
}

function iconClass(page) {
  return {
    'onhover': true,
    'add-icon-onhover': page === 'submission',
    'add-icon-onhover-chosen': route.name === page
  }
}
</script>
