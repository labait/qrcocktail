import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Routing } from './routing.js'

const app = createApp(App)
app.use(Routing.createRouter())
app.mount('#app')
