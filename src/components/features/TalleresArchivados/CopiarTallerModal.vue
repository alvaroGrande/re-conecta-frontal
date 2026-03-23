<script setup>
import { ref, computed, watch } from 'vue'
import { crearTaller } from '@services/talleres.js'
import { crearNotificacion } from '@services/notificaciones.js'
import { showSuccess, showError } from '@services/toastService'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
  visible: { type: Boolean, default: false },
  detalle: { type: Object,  default: null },
})

const emit = defineEmits(['update:visible', 'taller-creado'])

const nuevaFecha         = ref(null)
const copiandoTaller     = ref(false)
const usuariosANotificar = ref(new Set())

const asistentesParaNotificar = computed(() =>
  (props.detalle?.inscripciones ?? []).filter(i => i.asistio)
)

watch(() => props.visible, val => {
  if (val) {
    nuevaFecha.value = null
    usuariosANotificar.value = new Set(
      asistentesParaNotificar.value
        .filter(i => i.usuario_activo)
        .map(i => i.usuario_id)
    )
  }
})

function toggleUsuarioNotif(id) {
  const s = new Set(usuariosANotificar.value)
  s.has(id) ? s.delete(id) : s.add(id)
  usuariosANotificar.value = s
}

function seleccionarTodosActivos() {
  usuariosANotificar.value = new Set(
    asistentesParaNotificar.value.filter(i => i.usuario_activo).map(i => i.usuario_id)
  )
}

function deseleccionarTodos() {
  usuariosANotificar.value = new Set()
}

async function confirmarCopiar() {
  if (!nuevaFecha.value) {
    showError('Selecciona una fecha para el nuevo taller')
    return
  }
  copiandoTaller.value = true
  try {
    const d = props.detalle
    const nuevoTaller = await crearTaller({
      titulo:      d.titulo,
      descripcion: d.descripcion,
      duracion:    d.duracion,
      aforo:       d.aforo,
      modalidad:   d.modalidad,
      tipo_pago:   d.tipo_pago,
      fecha:       nuevaFecha.value instanceof Date ? nuevaFecha.value.toISOString() : nuevaFecha.value,
      activo:      1,
    })

    showSuccess('Taller creado', `"${nuevoTaller.titulo ?? d.titulo}" programado correctamente`)

    const seleccionados = asistentesParaNotificar.value.filter(
      i => usuariosANotificar.value.has(i.usuario_id) && i.usuario_activo
    )
    if (seleccionados.length > 0) {
      const errores = []
      for (const i of seleccionados) {
        try {
          await crearNotificacion({
            receptor_id: i.usuario_id,
            tipo:        'taller',
            titulo:      `Nuevo taller: ${d.titulo}`,
            contenido:   `Se ha programado una nueva edición del taller "${d.titulo}" el ${new Date(nuevaFecha.value).toLocaleDateString()}. ¡Te invitamos a participar de nuevo!`,
          })
        } catch {
          errores.push(i.nombre_usuario)
        }
      }
      if (errores.length) {
        showError(`No se pudo notificar a: ${errores.join(', ')}`)
      } else {
        showSuccess('Invitaciones enviadas', `${seleccionados.length} persona(s) notificada(s)`)
      }
    }

    emit('taller-creado')
    emit('update:visible', false)
  } catch (e) {
    showError(e?.response?.data?.message ?? e.message)
  } finally {
    copiandoTaller.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="`Programar nueva edición: ${detalle?.titulo}`"
    :modal="true"
    :closable="!copiandoTaller"
    :style="{ width: '480px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- Fecha -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nueva fecha y hora <span class="text-red-500">*</span>
        </label>
        <DatePicker
          v-model="nuevaFecha"
          class="w-full"
          date-format="dd/mm/yy"
          show-time
          hour-format="24"
          :min-date="new Date()"
          :disabled="copiandoTaller"
        />
      </div>

      <!-- Selección de destinatarios -->
      <div v-if="asistentesParaNotificar.length > 0">
        <div class="flex items-center justify-between mb-1">
          <label class="text-sm font-medium text-gray-700">Notificar a asistentes del taller anterior</label>
          <div class="flex gap-2 text-xs">
            <button class="text-blue-600 hover:underline" :disabled="copiandoTaller" @click="seleccionarTodosActivos">Todos los activos</button>
            <span class="text-gray-300">|</span>
            <button class="text-gray-400 hover:underline" :disabled="copiandoTaller" @click="deseleccionarTodos">Ninguno</button>
          </div>
        </div>
        <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          <label
            v-for="i in asistentesParaNotificar"
            :key="i.usuario_id"
            class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
            :class="{ 'opacity-50 cursor-not-allowed': !i.usuario_activo }"
          >
            <input
              type="checkbox"
              :checked="usuariosANotificar.has(i.usuario_id)"
              :disabled="!i.usuario_activo || copiandoTaller"
              class="shrink-0"
              @change="toggleUsuarioNotif(i.usuario_id)"
            />
            <span class="flex-1 text-sm truncate">{{ i.nombre_usuario }}</span>
            <span
              v-if="!i.usuario_activo"
              class="shrink-0 text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400"
            >ya no disponible</span>
          </label>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          {{ usuariosANotificar.size }} de {{ asistentesParaNotificar.length }} seleccionado(s)
        </p>
      </div>
      <p v-else class="text-sm text-gray-400 italic">
        Ningún asistente registrado en el taller original.
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" :disabled="copiandoTaller" @click="emit('update:visible', false)" />
        <Button label="Crear taller" icon="pi pi-check" :loading="copiandoTaller" @click="confirmarCopiar" />
      </div>
    </template>
  </Dialog>
</template>
