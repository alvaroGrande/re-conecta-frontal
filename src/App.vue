<template>
  <div class="flex flex-col min-h-screen">
   <Toast />
    <Header />

    <main class="flex-grow max-w-full p-4">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router'
import { useToast } from "primevue/usetoast";
import { setToast } from "./services/toastService";
const toast = useToast();

onMounted(() => {
  setToast(toast); // Registramos la instancia global
});
</script>
