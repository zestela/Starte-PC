import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

// Tailwind CSS（优先加载）
import './index.css'

// 全局样式（保留需要的）
import './css/styles.css'
// import './css/icons.css' // 已迁移到 SVG 组件，移除 312KB
// import './css/loading.css' // LoadingPage 已完全迁移
// import './css/share.css' // Share 已完全迁移
import './css/index.css'
import './css/vicissitudes.css'
// import './css/vici-detail.css' // VicissitudesDetail 已用 Tailwind 重写
import './css/wallpaper-list.css'
import './css/star-watching.css'
// import './css/settings.css' // Settings 已用 Tailwind 重写
import './css/submission.css'
import './css/search.css'
// import './css/check-new.css' // CheckNew 已用 Tailwind 重写

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 暴露 router 给主进程（托盘菜单用）
window.$router = router

app.mount('#app')

// 启动时初始化
const store = useAppStore()
store.init()
