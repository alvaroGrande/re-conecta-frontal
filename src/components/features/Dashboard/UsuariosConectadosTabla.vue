<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.connectedUsers.title') }}</h3>
        <button
         @click="$emit('actualizar')"
        class="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ArrowPathIcon class="w-4 h-4 inline mr-1" :class="{ 'animate-spin': cargando }" />
        Actualizar
      </button>
    </div>
    
    <div v-if="cargando" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="usuarios.length === 0" class="text-center py-8 text-gray-500">
      {{ $t('dashboard.connectedUsers.noUsers') }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('dashboard.connectedUsers.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('auth.email') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('users.role') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('dashboard.connectedUsers.lastActivity') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {{ obtenerIniciales(usuario.nombre, usuario.Apellidos) }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ usuario.nombre }} {{ usuario.Apellidos }}
                  </div>
                  <div class="flex items-center">
                    <span class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                    <span class="text-xs text-green-600 font-medium">{{ $t('dashboard.connectedUsers.online') }}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ usuario.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="obtenerColorRol(usuario.rol)">
                {{ obtenerNombreRol(usuario.rol) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatearFecha(usuario.ultimo_inicio) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
  import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import { obtenerNombreRol, obtenerColorRol } from '@helpers/rolesHelper'

defineProps({
  usuarios: {
    type: Array,
    default: () => []
  },
  cargando: {
    type: Boolean,
    default: false
  }
})

defineEmits(['actualizar'])

const obtenerIniciales = (nombre, apellidos) => {
  const inicial1 = nombre?.charAt(0) || ''
  const inicial2 = apellidos?.charAt(0) || ''
  return (inicial1 + inicial2).toUpperCase()
}

import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const formatearFecha = (fecha) => {
  if (!fecha) return t('dashboard.connectedUsers.never')
  const date = new Date(fecha)
  const ahora = new Date()
  const diffMs = ahora - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return t('dashboard.connectedUsers.justNow')
  if (diffMins < 60) return t('dashboard.connectedUsers.minutesAgo', { count: diffMins })
  
  const diffHoras = Math.floor(diffMins / 60)
  if (diffHoras < 24) return t('dashboard.connectedUsers.hoursAgo', { count: diffHoras })
  
  const localeCode = locale.value === 'ca' ? 'ca-ES' : locale.value === 'gl' ? 'gl-ES' : locale.value === 'en' ? 'en-US' : 'es-ES'
  return new Intl.DateTimeFormat(localeCode, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
