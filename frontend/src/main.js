import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import axios from 'axios';

const frontendKey = import.meta.env.VITE_CHASE_API_KEY;

if (frontendKey) {
  axios.defaults.headers.common['x-api-key'] = frontendKey;
} else {
  console.warn('Security Warning: VITE_CHASE_API_KEY is not defined in the frontend environment.');
}

createApp(App).mount('#app')
