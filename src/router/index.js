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
  { path: '/', name: 'loading', component: LoadingPage },
  { path: '/main', name: 'main', component: MainPage },
  { path: '/vicissitudes', name: 'vicissitudes', component: Vicissitudes },
  { path: '/vicissitudes-detail', name: 'vicissitudes-detail', component: VicissitudesDetail, props: true },
  { path: '/wallpaper-list', name: 'wallpaper-list', component: WallpaperList },
  { path: '/star-watching', name: 'star-watching', component: StarWatching },
  { path: '/settings', name: 'settings', component: Settings },
  { path: '/settings-about', redirect: '/settings?tab=about' },
  { path: '/submission', name: 'submission', component: Submission },
  { path: '/search', name: 'search', component: Search },
  { path: '/share', name: 'share', component: Share },
  { path: '/check-new', name: 'check-new', component: CheckNew },
  { path: '/donate', name: 'donate', component: Donate },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
