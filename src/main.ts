import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import router from './router'
import { bindRouter } from './composables/useMarketplace'

bindRouter(router)
createApp(App).use(router).mount('#app')
