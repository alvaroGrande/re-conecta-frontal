<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
    <div class="max-w-lg w-full text-center">
      <!-- Icono 404 -->
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-indigo-600 mb-2">404</h1>
        <div class="flex justify-center mb-4">
          <svg class="w-24 h-24 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      
      <!-- Mensaje -->
      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ $t ? $t('notFound.title') : 'Página no encontrada' }}
      </h2>
      <p class="text-gray-600 mb-8 text-lg">
        {{ $t ? $t('notFound.message') : 'Lo sentimos, la página que buscas no existe o ha sido movida.' }}
      </p>
      
      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          @click="goBack"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {{ $t ? $t('notFound.goBack') : 'Volver atrás' }}
        </button>
        <button 
          @click="goHome"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-lg"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          {{ $t ? $t('notFound.goHome') : 'Ir al inicio' }}
        </button>
      </div>
      
      <!-- Enlaces útiles -->
      <div class="mt-12 pt-8 border-t border-gray-300">
        <p class="text-gray-600 mb-4">
          {{ $t ? $t('notFound.helpText') : '¿Necesitas ayuda? Explora estas opciones:' }}
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <router-link 
            to="/services" 
            class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
          >
            {{ $t ? $t('notFound.services') : 'Servicios' }}
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link 
            to="/contact" 
            class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
          >
            {{ $t ? $t('notFound.contact') : 'Contacto' }}
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link 
            to="/about" 
            class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
          >
            {{ $t ? $t('notFound.about') : 'Acerca de' }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
/* Animación sutil para el ícono */
svg {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
