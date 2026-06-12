import { createRouter, createWebHashHistory } from 'vue-router'

import LoadingPage from '../views/LoadingPage.vue'
import MainPage from '../views/MainPage.vue'
import Vicissitudes from '../views/Vicissitudes.vue'
import VicissitudesDetail from '../views/VicissitudesDetail.vue'
import WallpaperList from '../views/WallpaperList.vue'
import StarWatching from '../views/StarWatching.vue'
import Settings from '../views/Settings.vue'
import Submission from '../views/Submission.vue'
import Search from '../views/Search.vue'
import Share from '../views/Share.vue'
import CheckNew from '../views/CheckNew.vue'
import Donate from '../views/Donate.vue'

const routes = [
  { path: '/', name: 'loading', component: LoadingPage, meta: { transition: 'fade' } },
  { path: '/main', name: 'main', component: MainPage, meta: { transition: 'fade' } },
  { path: '/vicissitudes', name: 'vicissitudes', component: Vicissitudes, meta: { transition: 'fade' } },
  { path: '/vicissitudes-detail', name: 'vicissitudes-detail', component: VicissitudesDetail, props: true, meta: { transition: 'slide-left' } },
  { path: '/wallpaper-list', name: 'wallpaper-list', component: WallpaperList, meta: { transition: 'fade' } },
  { path: '/star-watching', name: 'star-watching', component: StarWatching, meta: { transition: 'fade' } },
  { path: '/settings', name: 'settings', component: Settings, meta: { transition: 'scale' } },
  { path: '/settings-about', redirect: '/settings?tab=about' },
  { path: '/submission', name: 'submission', component: Submission, meta: { transition: 'scale' } },
  { path: '/search', name: 'search', component: Search, meta: { transition: 'fade' } },
  { path: '/share', name: 'share', component: Share, meta: { transition: 'scale' } },
  { path: '/check-new', name: 'check-new', component: CheckNew, meta: { transition: 'slide-left' } },
  { path: '/donate', name: 'donate', component: Donate, meta: { transition: 'slide-left' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
