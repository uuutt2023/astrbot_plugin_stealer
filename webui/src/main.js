import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueCookieNext } from 'vue-cookie-next';

import App from './App.vue';
import router from './router';
import './assets/app.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueCookieNext);

app.mount('#app');
