<template>
  <div class="configuracion-notificaciones">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Preferencias de Notificaciones</h2>
      <p class="text-sm text-gray-600">Configura cómo quieres recibir las notificaciones</p>
    </div>

    <!-- Estado de servicios -->
    <div v-if="estadoServicios" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-medium text-gray-800 mb-3">Estado de Servicios</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center gap-2">
          <i :class="estadoServicios.email.configurado ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-600'"></i>
          <span class="text-sm">Email</span>
          <span :class="estadoServicios.email.configurado ? 'text-green-600' : 'text-red-600'" class="text-xs">
            {{ estadoServicios.email.configurado ? 'Configurado' : 'No configurado' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="estadoServicios.whatsapp.configurado ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-600'"></i>
          <span class="text-sm">WhatsApp</span>
          <span :class="estadoServicios.whatsapp.configurado ? 'text-green-600' : 'text-red-600'" class="text-xs">
            {{ estadoServicios.whatsapp.configurado ? 'Configurado' : 'No configurado' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <i class="pi pi-bell text-blue-600"></i>
          <span class="text-sm">Push</span>
          <span class="text-green-600 text-xs">Siempre disponible</span>
        </div>
      </div>
    </div>

    <!-- Configuraciones por evento -->
    <div class="space-y-6">
      <div v-for="evento in eventosConfigurables" :key="evento.value" class="border border-gray-200 rounded-lg p-4">
        <h3 class="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <i :class="evento.icono" class="text-lg"></i>
          {{ evento.label }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Push -->
          <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center gap-2">
              <i class="pi pi-bell text-blue-600"></i>
              <span class="text-sm font-medium">Push</span>
            </div>
            <Checkbox
              :model-value="getConfigValue(evento.value, 'push')"
              @update:model-value="actualizarConfig(evento.value, 'push', $event)"
              :binary="true"
              :disabled="guardando"
            />
          </div>

          <!-- Email -->
          <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div class="flex items-center gap-2">
              <i class="pi pi-envelope text-green-600"></i>
              <span class="text-sm font-medium">Email</span>
            </div>
            <Checkbox
              :model-value="getConfigValue(evento.value, 'email')"
              @update:model-value="actualizarConfig(evento.value, 'email', $event)"
              :binary="true"
              :disabled="guardando || !estadoServicios?.email?.configurado"
            />
          </div>

          <!-- WhatsApp -->
          <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div class="flex items-center gap-2">
              <i class="pi pi-whatsapp text-purple-600"></i>
              <span class="text-sm font-medium">WhatsApp</span>
            </div>
            <Checkbox
              :model-value="getConfigValue(evento.value, 'whatsapp')"
              @update:model-value="actualizarConfig(evento.value, 'whatsapp', $event)"
              :binary="true"
              :disabled="guardando || !estadoServicios?.whatsapp?.configurado"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje informativo -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
      <div class="flex items-start gap-3">
        <i class="pi pi-info-circle text-blue-600 mt-0.5"></i>
        <div>
          <h4 class="font-medium text-blue-800 mb-1">Información</h4>
          <p class="text-sm text-blue-700">
            Las notificaciones push se muestran inmediatamente en la aplicación.
            Email y WhatsApp se procesan en cola y pueden tardar unos minutos en llegar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Checkbox from 'primevue/checkbox'
import {
  obtenerConfiguracionNotificaciones,
  actualizarConfiguracionNotificaciones,
  verificarEstadoServicios
} from '@services/notificaciones'
import { showSuccess, showError } from '@services/toastService'

const configuraciones = ref([])
const estadoServicios = ref(null)
const guardando = ref(false)

const eventosConfigurables = [
  {
    value: 'nuevo_taller',
    label: 'Nuevos Talleres',
    icono: 'pi pi-calendar-plus'
  },
  {
    value: 'nueva_encuesta',
    label: 'Nuevas Encuestas',
    icono: 'pi pi-question-circle'
  },
  {
    value: 'recordatorio',
    label: 'Recordatorios',
    icono: 'pi pi-clock'
  },
  {
    value: 'anuncio',
    label: 'Anuncios Generales',
    icono: 'pi pi-megaphone'
  }
]

const cargarConfiguraciones = async () => {
  try {
    const [config, servicios] = await Promise.all([
      obtenerConfiguracionNotificaciones(),
      verificarEstadoServicios()
    ])
    configuraciones.value = config
    estadoServicios.value = servicios
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
    showError('Error al cargar configuraciones')
  }
}

const getConfigValue = (tipoEvento, canal) => {
  const config = configuraciones.value.find(
    c => c.tipo_evento === tipoEvento && c.canal === canal
  )
  return config ? config.activo : false
}

const actualizarConfig = async (tipoEvento, canal, activo) => {
  guardando.value = true
  try {
    await actualizarConfiguracionNotificaciones({
      tipo_evento: tipoEvento,
      canal: canal,
      activo: activo
    })

    // Actualizar localmente
    const existingConfig = configuraciones.value.find(
      c => c.tipo_evento === tipoEvento && c.canal === canal
    )

    if (existingConfig) {
      existingConfig.activo = activo
    } else {
      configuraciones.value.push({
        tipo_evento: tipoEvento,
        canal: canal,
        activo: activo
      })
    }

    showSuccess('Configuración actualizada')
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    showError('Error al actualizar configuración')
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarConfiguraciones()
})
</script>