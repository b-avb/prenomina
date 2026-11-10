import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { registerActorHeaders } from './bootstrap/actor-headers';
import { router } from './router';
import { useAuthStore } from './stores/auth.store';
import { useStateSyncStore } from './stores/state-sync.store';
import './styles/main.scss';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

registerActorHeaders(pinia);
void useAuthStore(pinia).refreshSession();
void useStateSyncStore(pinia).initialize();

app.mount('#root');

