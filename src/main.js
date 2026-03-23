
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { MyPreset } from './config/primevuePreset';
import App from './App.vue'
import ToastService from "primevue/toastservice";
import ConfirmationService from 'primevue/confirmationservice';
import Toast from "primevue/toast";
import Tooltip from 'primevue/tooltip';
import i18n from './i18n';
import { primevueLocale } from './i18n/primevueLocale';

// Importar iconos de PrimeIcons
import 'primeicons/primeicons.css';

import router from './router'

import Button from 'primevue/button';
import Select from 'primevue/select';
import { conectarSocket, desconectarSocket } from './services/socketService';


const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: '.p-dark'
        }
    },
    ripple: true,
    locale: primevueLocale,
});
app.component('Button', Button);
app.component('Select', Select);
app.component("Toast", Toast);
app.directive('tooltip', Tooltip);
app.use(router)
app.use(i18n)
app.use(ToastService)
app.use(ConfirmationService)

// Conectar Socket.IO si hay token
const token = localStorage.getItem('token')
if (token) {
  conectarSocket(token)
}

// Desconectar Socket.IO al cerrar la aplicación
window.addEventListener('beforeunload', () => {
  desconectarSocket()
})

app.mount("#app")
