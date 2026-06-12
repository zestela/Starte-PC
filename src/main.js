import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

// 全局 CSS
import './css/styles.css'
import './css/icons.css'
import './css/loading.css'
import './css/index.css'
import './css/vicissitudes.css'
import './css/vici-detail.css'
import './css/wallpaper-list.css'
import './css/star-watching.css'
import './css/settings.css'
import './css/submission.css'
import './css/search.css'
import './css/share.css'
import './css/check-new.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 暴露 router 给主进程（托盘菜单用）
window.$router = router

app.mount('#app')

// 启动时初始化
const store = useAppStore()
store.init()
