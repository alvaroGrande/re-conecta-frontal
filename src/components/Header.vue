<template>
  <header class="bg-primary text-white shadow-md">
    <div class="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
      <!-- Logo -->
      <h1 class="text-xl font-bold">
        <RouterLink to="/">
          <img :src="logo" alt="Re-Conecta Logo" class="h-8"/>
        </RouterLink>
      </h1>

      <!-- Menú de escritorio -->
      <nav class="hidden md:flex space-x-6">
        <RouterLink to="/" class="hover:text-accent">Inicio</RouterLink>
        <RouterLink to="/about" class="hover:text-accent">Nosotros</RouterLink>
        <RouterLink to="/services" class="hover:text-accent">Servicios</RouterLink>
        <RouterLink to="/contact" class="hover:text-accent">Contacto</RouterLink>
      </nav>

      <!-- Icono hamburguesa móvil -->
      <button @click="isOpen = !isOpen" class="md:hidden focus:outline-none">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            v-if="!isOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Menú móvil desplegable -->
    <nav v-if="isOpen" class="md:hidden bg-primary px-4 pb-4">
      <ul class="flex flex-col space-y-2">
        <li><RouterLink @click="isOpen=false" to="/" class="hover:text-gray-200">Inicio</RouterLink></li>
        <li><RouterLink @click="isOpen=false" to="/about" class="hover:text-gray-200">Nosotros</RouterLink></li>
        <li><RouterLink @click="isOpen=false" to="/services" class="hover:text-gray-200">Servicios</RouterLink></li>
        <li><RouterLink @click="isOpen=false" to="/contact" class="hover:text-gray-200">Contacto</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '../assets/re-conecta.svg'

const isOpen = ref(false)
</script>
