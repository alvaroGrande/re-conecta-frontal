<template>
  <Dialog
    :visible="visible"
    modal
    header="Enviar Notificación"
    :style="{ width: '500px' }"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- Tipo de notificación -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
        <Dropdown
          v-model="form.tipo"
          :options="tiposNotificacion"
          option-label="label"
          option-value="value"
          placeholder="Selecciona el tipo"
          class="w-full"
        />
      </div>

      <!-- Destinatario preseleccionado (solo lectura) -->
      <div v-if="receptorPreseleccionado && !envioMasivo">
        <label class="block text-sm font-medium text-gray-700 mb-2">Destinatario</label>
        <div class="p-3 bg-gray-100 rounded-lg border border-gray-300">
          <div class="flex items-center gap-2">
            <i class="pi pi-user text-blue-600"></i>
            <span class="font-medium">
              {{ receptorPreseleccionado.nombre }} {{ receptorPreseleccionado.Apellidos }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {{ getRolTexto(receptorPreseleccionado.rol) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Receptor (si no es masiva y no hay preseleccionado) -->
      <div v-else-if="!envioMasivo">
        <label class="block text-sm font-medium text-gray-700 mb-2">Destinatario</label>
        <Dropdown
          v-model="form.receptor_id"
          :options="destinatariosDisponibles"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un destinatario"
          class="w-full"
          filter
        />
      </div>

      <!-- Checkbox para envío masivo (solo instructores/admin) -->
      <div v-if="puedeEnviarMasivo" class="flex items-center gap-2">
        <Checkbox v-model="envioMasivo" :binary="true" input-id="masivo" />
        <label for="masivo" class="text-sm cursor-pointer">
          Enviar a todos mis usuarios coordinados
        </label>
      </div>

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
        <InputText
          v-model="form.titulo"
          placeholder="Título de la notificación"
          class="w-full"
          maxlength="255"
        />
      </div>

      <!-- Contenido -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
        <Textarea
          v-model="form.contenido"
          placeholder="Escribe tu mensaje..."
          rows="4"
          class="w-full"
          maxlength="1000"
        />
        <div class="text-xs text-gray-500 mt-1">
          {{ form.contenido.length }}/1000 caracteres
        </div>
      </div>

      <!-- URL (opcional) - Solo Admin e Instructor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Enlace (opcional)
        </label>
        <InputText
          v-model="form.url"
          placeholder="/talleres, /encuestas, etc."
          class="w-full"
        />
        <div class="text-xs text-gray-500 mt-1">
          Ruta interna de la aplicación
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        severity="secondary"
        @click="cerrar"
      />
      <Button
        :label="envioMasivo ? 'Enviar a Todos' : 'Enviar'"
        @click="enviar"
        :loading="enviando"
        :disabled="!formularioValido"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { crearNotificacion, enviarNotificacionMasiva } from '@services/notificaciones'
import { obtenerContactos, obtenerUsuariosCoordinados } from '@services/contactos'
import { showSuccess, showError } from '@services/toastService'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  receptorPreseleccionado: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'enviado'])

const form = ref({
  tipo: 'mensaje',
  receptor_id: null,
  titulo: '',
  contenido: '',
  url: ''
})

const enviando = ref(false)
const destinatarios = ref([])
const envioMasivo = ref(false)

const tiposNotificacion = [
  { label: '💬 Mensaje', value: 'mensaje' },
  { label: '📢 Anuncio', value: 'anuncio' },
  { label: '⏰ Recordatorio', value: 'recordatorio' },
  { label: '⚠️ Alerta', value: 'alerta' }
]

const user = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const puedeEnviarMasivo = computed(() => {
  return user.value?.rol === 1 || user.value?.rol === 2
})

const destinatariosDisponibles = computed(() => {
  return destinatarios.value.map(d => ({
    label: `${d.nombre} ${d.Apellidos || ''} (${getRolTexto(d.rol)})`,
    value: d.id
  }))
})

const formularioValido = computed(() => {
  if (!form.value.titulo.trim() || !form.value.contenido.trim()) {
    return false
  }
  if (!envioMasivo.value && !form.value.receptor_id) {
    return false
  }
  return true
})

const getRolTexto = (rol) => {
  const roles = { 1: 'Admin', 2: 'Instructor', 3: 'Usuario' }
  return roles[rol] || 'Usuario'
}

const cargarDestinatarios = async () => {
  try {
    if (user.value.rol === 2) {
      // Instructores: sus usuarios coordinados
      destinatarios.value = await obtenerUsuariosCoordinados()
    } else {
      // Usuarios normales: sus contactos
      destinatarios.value = await obtenerContactos()
    }
  } catch (error) {
    console.error('Error al cargar destinatarios:', error)
  }
}

const enviar = async () => {
  enviando.value = true
  try {
    if (envioMasivo.value) {
      // Envío masivo
      const receptoresIds = destinatarios.value.map(d => d.id)
      await enviarNotificacionMasiva({
        receptores_ids: receptoresIds,
        tipo: form.value.tipo,
        titulo: form.value.titulo,
        contenido: form.value.contenido,
        url: form.value.url || undefined
      })
      showSuccess(`Notificación enviada a ${receptoresIds.length} usuarios`)
    } else {
      // Envío individual
      await crearNotificacion({
        receptor_id: form.value.receptor_id,
        tipo: form.value.tipo,
        titulo: form.value.titulo,
        contenido: form.value.contenido,
        url: form.value.url || undefined
      })
      showSuccess('Notificación enviada correctamente')
    }

    // Solo emitir el evento, NO mostrar toast aquí porque ya se mostró arriba
    emit('enviado')
    cerrar()
    resetForm()
  } catch (error) {
    console.error('Error al enviar notificación:', error)
    showError(error.response?.data?.message || 'Error al enviar notificación')
  } finally {
    enviando.value = false
  }
}

const cerrar = () => {
  emit('update:visible', false)
}

const resetForm = () => {
  form.value = {
    tipo: 'mensaje',
    receptor_id: null,
    titulo: '',
    contenido: '',
    url: ''
  }
  envioMasivo.value = false
}

// Watch para cargar destinatarios cuando se abre el modal
watch(() => props.visible, (newVal) => {
  if (newVal) {
    cargarDestinatarios()
    
    // Si hay receptor preseleccionado
    if (props.receptorPreseleccionado) {
      form.value.receptor_id = props.receptorPreseleccionado.id
    }
  }
})
</script>
