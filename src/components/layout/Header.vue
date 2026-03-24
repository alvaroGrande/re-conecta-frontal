<template>
  <header class="bg-primary text-white shadow-md">
    <div class="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
      <!-- Logo -->
      <h1 class="text-xl font-bold">
        <RouterLink to="/" aria-label="Re-Conecta — Ir a inicio">
          <img :src="logo" alt="" class="h-8" />
        </RouterLink>
      </h1>

      <!-- Menú de escritorio - Solo visible si hay sesión -->
      <nav v-if="isAuthenticated" class="hidden md:flex space-x-6 items-center" aria-label="Navegación principal">
        <RouterLink v-if="esAdmin" to="/dashboard" class="hover:text-accent flex items-center gap-1">
          <i class="pi pi-chart-bar" aria-hidden="true"></i>
          {{ $t('nav.dashboard') }}
        </RouterLink>
        <RouterLink to="/about" class="hover:text-accent">Nosotros</RouterLink>
        <RouterLink to="/encuestas" class="hover:text-accent flex items-center gap-1">
          {{ $t('nav.surveys') }}
        </RouterLink>
        <RouterLink to="/contact" class="hover:text-accent">{{ $t('nav.contact') }}</RouterLink>
        <RouterLink to="/calendario" class="hover:text-accent flex items-center gap-1">
          {{ $t('nav.calendar') }}
        </RouterLink>
        <RouterLink v-if="esAdmin" to="/usuarios" class="hover:text-accent">{{ $t('nav.users') }}</RouterLink>
        <RouterLink v-if="esAdmin" to="/roles-permisos" class="hover:text-accent flex items-center gap-1" aria-label="Roles y Permisos" title="Roles y Permisos">
          <i class="pi pi-shield" aria-hidden="true"></i>
        </RouterLink>
        <RouterLink to="/perfil" class="hover:text-accent" aria-label="Mi perfil" title="Mi perfil">
          <i class="pi pi-user text-white" aria-hidden="true"></i>
        </RouterLink>
        
        <!-- Panel de notificaciones -->
        <NotificacionesPanel />

        <!-- Toggle modo claro/oscuro -->
        <button
          @click="toggleTheme"
          class="hover:text-accent flex items-center gap-1 transition-colors"
          :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          :title="isDark ? 'Modo claro' : 'Modo oscuro'"
        >
          <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
        </button>

        <!-- Botón de cerrar sesión -->
        <button
          @click="handleLogout"
          class="hover:text-accent flex items-center gap-1"
        >
          <i class="pi pi-sign-out" aria-hidden="true"></i>
          {{ $t('app.logout') }}
        </button>
      </nav>

      <!-- Icono hamburguesa móvil - Solo visible si hay sesión -->
      <button v-if="isAuthenticated" @click="isOpen = !isOpen" class="md:hidden focus:outline-none" :aria-label="isOpen ? 'Cerrar menú' : 'Abrir menú'" :aria-expanded="isOpen">
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

    <!-- Menú móvil desplegable - Solo visible si hay sesión -->
    <nav v-if="isOpen && isAuthenticated" class="md:hidden bg-primary px-4 pb-4" aria-label="Menú móvil">
      <ul class="flex flex-col space-y-2">
        <li><RouterLink @click="isOpen=false" to="/" class="hover:text-gray-200">Inicio</RouterLink></li>
        <li v-if="esAdmin">
<RouterLink @click="isOpen=false" to="/dashboard" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-chart-bar" aria-hidden="true"></i>
          Dashboard
        </RouterLink>
</li>
        <li><RouterLink @click="isOpen=false" to="/about" class="hover:text-gray-200">Nosotros</RouterLink></li>
        <li>
<RouterLink @click="isOpen=false" to="/encuestas" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-chart-line" aria-hidden="true"></i>
          {{ $t('nav.surveys') }}
        </RouterLink>
</li>
        <li><RouterLink @click="isOpen=false" to="/contact" class="hover:text-gray-200">Contacto</RouterLink></li>
        <li>
<RouterLink @click="isOpen=false" to="/calendario" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-calendar" aria-hidden="true"></i>
          {{ $t('nav.calendar') }}
        </RouterLink>
</li>
        <li v-if="esAdmin">
<RouterLink @click="isOpen=false" to="/usuarios" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-users" aria-hidden="true"></i>
          {{ $t('nav.users') }}
        </RouterLink>
</li>
        <li v-if="esAdmin">
<RouterLink @click="isOpen=false" to="/roles-permisos" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-shield" aria-hidden="true"></i>
          Roles y Permisos
        </RouterLink>
</li>
        <li>
<RouterLink @click="isOpen=false" to="/perfil" class="hover:text-gray-200 flex items-center gap-2">
          <i class="pi pi-user" aria-hidden="true"></i>
          Mi Perfil
        </RouterLink>
</li>
        <li>
          <button
            @click="toggleTheme"
            class="hover:text-gray-200 flex items-center gap-2"
            :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
            {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
          </button>
        </li>
        <li>
          <button @click="handleLogout" class="hover:text-gray-200 flex items-center gap-2">
            <i class="pi pi-sign-out" aria-hidden="true"></i>
            Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { logout } from '@services/auth'
import { useTheme } from '@composables/useTheme'
import { showSuccess } from '@services/toastService'
import { useAuth } from '@composables/useAuth'
import Button from 'primevue/button'
import logo from '@/assets/re-conecta.svg'
import NotificacionesPanel from '@features/Notificaciones/NotificacionesPanel.vue'
import LanguageSwitcher from '@shared/LanguageSwitcher.vue'

const router = useRouter()
const isOpen = ref(false)
const { isAuthenticated, esAdmin, clearAuth } = useAuth()
const { isDark, toggleTheme } = useTheme()

// Manejar cierre de sesión
const handleLogout = () => {
  logout()
  clearAuth()
  showSuccess('Sesión cerrada correctamente')
  router.push({ name: 'Login' })
  isOpen.value = false
}
</script>
