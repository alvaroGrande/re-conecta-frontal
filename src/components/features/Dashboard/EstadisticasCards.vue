<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Usuarios -->
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.stats.totalUsers') }}</p>
          <Skeleton v-if="cargandoUsuarios" width="6rem" height="2.5rem" class="mt-2" />
          <p v-else class="mt-2 text-3xl font-bold text-gray-900">{{ estadisticas.totalUsuarios }}</p>
        </div>
        <div class="p-3 bg-blue-100 rounded-full">
          <UserGroupIcon class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <Skeleton v-if="cargandoUsuarios" width="8rem" height="1rem" />
        <span v-else>{{ estadisticas.usuariosActivos }} {{ $t('dashboard.stats.activeToday') }}</span>
      </div>
    </div>

    <!-- Usuarios Conectados -->
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.stats.connectedNow') }}</p>
          <Skeleton v-if="cargandoUsuarios" width="4rem" height="2.5rem" class="mt-2" />
          <p v-else class="mt-2 text-3xl font-bold text-green-600">{{ estadisticas.usuariosConectados }}</p>
        </div>
        <div class="p-3 bg-green-100 rounded-full">
          <SignalIcon class="w-8 h-8 text-green-600" />
        </div>
      </div>
      <div class="mt-4">
        <button 
          @click="$emit('ver-conectados')"
          class="text-sm text-green-600 hover:text-green-800 font-medium"
          :disabled="cargandoUsuarios"
        >
          {{ $t('dashboard.stats.viewDetails') }} →
        </button>
      </div>
    </div>

    <!-- Talleres Activos -->
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.stats.activeWorkshops') }}</p>
          <Skeleton v-if="cargandoTalleres" width="4rem" height="2.5rem" class="mt-2" />
          <p v-else class="mt-2 text-3xl font-bold text-purple-600">{{ estadisticas.talleresActivos }}</p>
        </div>
        <div class="p-3 bg-purple-100 rounded-full">
          <AcademicCapIcon class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <Skeleton v-if="cargandoTalleres" width="7rem" height="1rem" />
        <span v-else>{{ estadisticas.talleresMes }} {{ $t('dashboard.stats.workshopsThisMonth') }}</span>
      </div>
    </div>

    <!-- Encuestas Activas -->
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ $t('dashboard.stats.activeSurveys') }}</p>
          <Skeleton v-if="cargandoEncuestas" width="4rem" height="2.5rem" class="mt-2" />
          <p v-else class="mt-2 text-3xl font-bold text-yellow-600">{{ estadisticas.encuestasActivas }}</p>
        </div>
        <div class="p-3 bg-yellow-100 rounded-full">
          <ClipboardDocumentCheckIcon class="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <Skeleton v-if="cargandoEncuestas" width="10rem" height="1rem" />
        <span v-else>{{ estadisticas.respuestasEncuestas }} {{ $t('dashboard.stats.surveyResponses') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserGroupIcon, SignalIcon, AcademicCapIcon, ClipboardDocumentCheckIcon } from '@heroicons/vue/24/outline'
import Skeleton from 'primevue/skeleton'

defineProps({
  estadisticas: {
    type: Object,
    required: true
  },
  cargandoUsuarios: {
    type: Boolean,
    default: false
  },
  cargandoTalleres: {
    type: Boolean,
    default: false
  },
  cargandoEncuestas: {
    type: Boolean,
    default: false
  }
})

defineEmits(['ver-conectados'])
</script>
