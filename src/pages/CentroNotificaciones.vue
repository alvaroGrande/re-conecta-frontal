<template>
  <div class="min-w-full max-w-full px-4 py-4">
    <!-- Cabecera -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <i class="pi pi-bell text-blue-600"></i>
          Centro de Notificaciones
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Gestiona todas tus notificaciones en un solo lugar
        </p>
      </div>

      <Button
        v-if="puedeEnviar"
        label="Nueva notificación"
        icon="pi pi-plus"
        size="small"
        @click="dialogNueva = true"
      />
    </div>

    <!-- Pestañas de navegación -->
    <div class="flex border-b border-gray-200 dark:border-slate-700 mb-6">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        :class="[
          'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          $route.name === tab.name
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        ]"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
        <span
          v-if="tab.name === 'NotificacionesRecibidas' && noLeidas > 0"
          class="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full leading-none"
        >
          {{ noLeidas }}
        </span>
      </RouterLink>
    </div>

    <!-- Vista hija según ruta activa -->
    <RouterView @actualizar-contador="actualizarContador" />

    <!-- Dialog nueva notificación -->
    <EnviarNotificacionModal
      v-if="puedeEnviar"
      v-model:visible="dialogNueva"
      @enviado="dialogNueva = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import Button from 'primevue/button'
import EnviarNotificacionModal from '@features/Notificaciones/EnviarNotificacionModal.vue'
import { contarNoLeidas } from '@services/notificaciones'
import { useAuth } from '@composables/useAuth'

const { usuario } = useAuth()

const noLeidas = ref(0)
const dialogNueva = ref(false)

const puedeEnviar = computed(() => usuario.value?.rol === 1 || usuario.value?.rol === 2)

const tabs = [
  { name: 'NotificacionesRecibidas', label: 'Recibidas', icon: 'pi pi-inbox' },
  { name: 'NotificacionesEnviadas', label: 'Enviadas', icon: 'pi pi-send' }
]

const actualizarContador = async () => {
  try {
    noLeidas.value = await contarNoLeidas()
  } catch {
    // silencioso
  }
}

onMounted(actualizarContador)
</script>
