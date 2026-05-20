<template>
  <Dialog
    v-model:visible="visible"
    :header="modoEdicion ? 'Editar grupo' : 'Nuevo grupo de chat'"
    modal
    :style="{ width: '500px' }"
    :draggable="false"
    @hide="resetear"
  >
    <div class="flex flex-col gap-4 pt-1">
      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre del grupo *</label>
        <InputText v-model="form.nombre" placeholder="Ej. Coordinadores de zona norte" maxlength="120" />
      </div>

      <!-- Descripción -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Descripción</label>
        <Textarea v-model="form.descripcion" placeholder="Opcional" rows="2" :autoResize="true" />
      </div>

      <!-- Chat Efímero -->
      <div class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <i class="pi pi-clock text-amber-500"></i>
              Chat efímero
            </p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Los mensajes se eliminarán automáticamente después del tiempo configurado
            </p>
          </div>
          <ToggleSwitch v-model="form.es_efimero" />
        </div>

        <Transition name="slide-down">
          <div v-if="form.es_efimero" class="flex items-center gap-3 mt-1">
            <label class="text-sm text-gray-600 dark:text-slate-400 shrink-0">Duración de los mensajes:</label>
            <Select
              v-model="form.ttl_horas"
              :options="opcionesTTL"
              optionLabel="label"
              optionValue="value"
              class="flex-1"
              placeholder="Selecciona duración..."
            />
          </div>
        </Transition>
      </div>

      <!-- Miembros (solo en creación) -->
      <div v-if="!modoEdicion" class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">Miembros</label>
        <MultiSelect
          v-model="form.miembros"
          :options="usuariosDisponibles"
          optionLabel="nombre_completo"
          optionValue="id"
          placeholder="Selecciona participantes..."
          filter
          filterPlaceholder="Buscar usuarios..."
          display="chip"
          :loading="cargandoUsuarios"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="visible = false" />
        <Button
          :label="modoEdicion ? 'Guardar cambios' : 'Crear grupo'"
          icon="pi pi-check"
          :loading="guardando"
          :disabled="!form.nombre.trim()"
          @click="guardar"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import { crearChat, actualizarChat } from '@services/chat'
import { getUsuarios } from '@services/usuarios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  chatEditar: { type: Object, default: null }  // si se pasa, modo edición
})
const emit = defineEmits(['update:modelValue', 'chat-creado', 'chat-actualizado'])

const toast = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const modoEdicion = computed(() => !!props.chatEditar)

const opcionesTTL = [
  { label: '1 hora', value: 1 },
  { label: '6 horas', value: 6 },
  { label: '12 horas', value: 12 },
  { label: '24 horas', value: 24 },
  { label: '3 días', value: 72 },
  { label: '7 días', value: 168 },
  { label: 'Nunca caduca', value: null }
]

const form = ref({
  nombre: '',
  descripcion: '',
  es_efimero: false,
  ttl_horas: null,
  miembros: []
})

const guardando = ref(false)
const cargandoUsuarios = ref(false)
const usuariosRaw = ref([])

const usuariosDisponibles = computed(() =>
  usuariosRaw.value.map(u => ({
    ...u,
    nombre_completo: `${u.nombre} ${u.Apellidos || ''}`.trim()
  }))
)

const resetear = () => {
  form.value = { nombre: '', descripcion: '', es_efimero: false, ttl_horas: null, miembros: [] }
}

// Cargar usuarios al abrir
watch(visible, async (abierto) => {
  if (!abierto) return

  if (modoEdicion.value && props.chatEditar) {
    form.value.nombre = props.chatEditar.nombre
    form.value.descripcion = props.chatEditar.descripcion || ''
    form.value.es_efimero = props.chatEditar.es_efimero
    form.value.ttl_horas = props.chatEditar.ttl_horas ?? null
  }

  if (!modoEdicion.value && !usuariosRaw.value.length) {
    cargandoUsuarios.value = true
    try {
      const data = await getUsuarios({}, { limit: 200 })
      usuariosRaw.value = data.data || []
    } catch {
      toast.add({ severity: 'warn', summary: 'No se pudieron cargar usuarios', life: 3000 })
    } finally {
      cargandoUsuarios.value = false
    }
  }
})

const guardar = async () => {
  if (!form.value.nombre.trim()) return
  guardando.value = true
  try {
    if (modoEdicion.value) {
      const actualizado = await actualizarChat(props.chatEditar.id, {
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion?.trim() || null,
        es_efimero: form.value.es_efimero,
        ttl_horas: form.value.ttl_horas
      })
      emit('chat-actualizado', actualizado)
      toast.add({ severity: 'success', summary: 'Grupo actualizado', life: 3000 })
    } else {
      const chat = await crearChat({
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion?.trim() || null,
        es_efimero: form.value.es_efimero,
        ttl_horas: form.value.ttl_horas,
        miembros: form.value.miembros
      })
      emit('chat-creado', chat)
      toast.add({ severity: 'success', summary: 'Grupo creado', life: 3000 })
    }
    visible.value = false
  } catch {
    toast.add({ severity: 'error', summary: 'Error al guardar el grupo', life: 3000 })
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
