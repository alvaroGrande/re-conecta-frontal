<template>
  <Dialog
    :visible="modelValue"
    modal
    header="Nuevo mensaje directo"
    :style="{ width: '26rem' }"
    :draggable="false"
    @update:visible="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-gray-500 dark:text-slate-400">
        Busca un usuario para iniciar una conversación privada.
      </p>

      <AutoComplete
        v-model="seleccionado"
        :suggestions="sugerencias"
        option-label="nombreCompleto"
        placeholder="Buscar usuario..."
        :min-length="1"
        force-selection
        fluid
        @complete="buscar"
      >
        <template #option="{ option }">
          <div class="flex items-center gap-2">
            <img
              v-if="option.foto_perfil"
              :src="option.foto_perfil"
              class="w-7 h-7 rounded-full object-cover shrink-0"
              alt=""
            />
            <span
              v-else
              class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0"
            >
              {{ iniciales(option) }}
            </span>
            <span class="text-sm">{{ option.nombreCompleto }}</span>
          </div>
        </template>
      </AutoComplete>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="Cancelar"
          severity="secondary"
          @click="emit('update:modelValue', false)"
        />
        <Button
          label="Iniciar chat"
          :disabled="!seleccionado?.id"
          :loading="enviando"
          @click="confirmar"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import { buscarUsuarios } from '@services/contactos'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'iniciar'])

const seleccionado = ref(null)
const sugerencias = ref([])
const enviando = ref(false)

const buscar = async (event) => {
  try {
    const res = await buscarUsuarios(event.query)
    const lista = Array.isArray(res) ? res : res?.data ?? []
    sugerencias.value = lista.map(u => ({
      ...u,
      nombreCompleto: [u.nombre, u.Apellidos].filter(Boolean).join(' ')
    }))
  } catch {
    sugerencias.value = []
  }
}

const iniciales = (u) => {
  const n = u.nombre?.[0] ?? ''
  const a = u.Apellidos?.[0] ?? ''
  return (n + a).toUpperCase() || '?'
}

const confirmar = async () => {
  if (!seleccionado.value?.id) return
  enviando.value = true
  try {
    emit('iniciar', seleccionado.value.id)
    seleccionado.value = null
    emit('update:modelValue', false)
  } finally {
    enviando.value = false
  }
}
</script>
