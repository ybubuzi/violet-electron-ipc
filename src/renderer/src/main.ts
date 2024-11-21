import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

setTimeout(async () => {
  const a = window.api.message.getMsg()
  console.log(a)
}, 5000)
