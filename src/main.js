import { createApp } from 'vue'
import App from './App.vue'
import '@picocss/pico'
import './app.css'
import router from './router'

createApp(App).use(router).mount('#app')
