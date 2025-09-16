
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset, $dt, palette  } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import App from './App.vue'
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";


import router from './router'

import Button from 'primevue/button';


const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      100: '#D2E6F0',
      200: '#A6CCE0',
      300: '#79B2D1',
      400: '#4C97C1',
      500: '#0B5E8A',
      600: '#0A5278',
      700: '#084061',
      800: '#062E49',
      900: '#041D31',
    },
    secondary: {
      100: '#D2F3F4',
      200: '#A6E3E4',
      300: '#73D3D5',
      400: '#40C3C5',
      500: '#19A7A9',
      600: '#168F91',
      700: '#117273',
      800: '#0C5556',
      900: '#073838',
    },
    accent: {
      100: '#FBD6C5',
      200: '#F7AC91',
      300: '#F4825D',
      400: '#F16539',
      500: '#F06B2D',
      600: '#D95C28',
      700: '#B84B22',
      800: '#94401C',
      900: '#732F16',
    },
  },
  // Mapear severity para botones, badges y tags
  components: {
    button: {
      root: {
        class: `
          data-[severity=secondary]:bg-secondary-500 
          data-[severity=secondary]:text-white
          data-[severity=accent]:bg-accent-500
          data-[severity=accent]:text-white
        `
      }
    },
    badge: {
      root: {
        class: `
          data-[severity=secondary]:bg-secondary-500 
          data-[severity=secondary]:text-white
          data-[severity=accent]:bg-accent-500
          data-[severity=accent]:text-white
        `
      }
    },
    tag: {
      root: {
        class: `
          data-[severity=secondary]:bg-secondary-500 
          data-[severity=secondary]:text-white
          data-[severity=accent]:bg-accent-500
          data-[severity=accent]:text-white
        `
      }
    }
  }
});
// const values1 = palette('#0B5E8A');
// const primaryColor = $dt('primary.color');
// console.log(primaryColor)

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: MyPreset
    },
    ripple: true
});
app.component('Button', Button);
app.component("Toast", Toast);
app.use(router)

app.use(ToastService)

app.mount("#app")
