<script setup>
import { ref } from 'vue'
import LOVManager from '@features/Configuracion/LOVManager.vue'
import ConfiguracionNotificaciones from '@features/Notificaciones/ConfiguracionNotificaciones.vue'

const seccion = ref('lov')
</script>

<template>
  <div class="min-w-full max-w-full px-4 py-4">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Configuración</h1>
      <p class="text-gray-500 text-sm mt-1">Administra los parámetros globales de la aplicación</p>
    </div>

    <!-- Tabs de sección -->
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        :class="seccion === 'lov'
          ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600'
          : 'px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700'"
      >
        <i class="pi pi-list mr-2" />Listas de valores (LOV)
      </button>
      <button
        :class="seccion === 'notificaciones'
          ? 'px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600'
          : 'px-4 py-2 text-sm font-medium border-transparent text-gray-500 hover:text-gray-700'"
        @click="seccion = 'notificaciones'"
      >
        <i class="pi pi-bell mr-2" />Notificaciones
      </button>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
      <LOVManager v-if="seccion === 'lov'" />
      <ConfiguracionNotificaciones v-if="seccion === 'notificaciones'" />
    </div>
  </div>
</template>
