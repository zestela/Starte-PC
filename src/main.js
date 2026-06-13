import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

// Tailwind CSS（优先加载）
import './index.css'

// 全局样式（保留需要的）
import './css/styles.css'
import './css/index.css'
import './css/vicissitudes.css'
import './css/wallpaper-list.css'
import './css/star-watching.css'
import './css/search.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 暴露 router 给主进程（托盘菜单用）
window.$router = router

app.mount('#app')

// 启动时初始化
const store = useAppStore()
store.init()
