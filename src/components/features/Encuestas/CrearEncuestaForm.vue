<template>
  <div class="flex flex-col" style="height: 70vh;">
    <!-- Contenido con scroll -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
    <!-- Panel izquierdo: Datos básicos - FIJO Y STICKY (1/3) -->
    <div class="lg:col-span-1 space-y-3 lg:sticky lg:top-0 lg:self-start">
      <div class="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <h3 class="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">Información básica</h3>
        <div class="space-y-2">
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Título</label>
            <InputText 
              v-model="formulario.titulo"
              placeholder="Título de la encuesta"
              class="w-full text-sm"
              size="small"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Descripción</label>
            <Textarea 
              v-model="formulario.descripcion"
              placeholder="Breve descripción"
              class="w-full text-sm"
              rows="2"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha fin</label>
            <DatePicker 
              v-model="formulario.fecha_fin"
              date-format="dd/mm/yy"
              :show-icon="true"
              :min-date="new Date()"
              class="w-full"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: Preguntas con scroll independiente (2/3) -->
    <div class="lg:col-span-2 flex flex-col min-h-0">
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 class="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Preguntas ({{ formulario.preguntas.length }})
        </h3>
        <Button 
          icon="pi pi-plus"
          label="Nueva pregunta"
          severity="info"
          size="small"
          @click="agregarPregunta"
        />
      </div>

      <div v-if="formulario.preguntas.length === 0" class="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 dark:text-slate-400 text-sm font-medium">Sin preguntas aún</p>
          <p class="text-gray-400 dark:text-slate-500 text-xs mt-1">Haz clic en "Nueva pregunta" para comenzar</p>
        </div>
      </div>

      <!-- Lista de preguntas con scroll INDEPENDIENTE -->
      <div v-else class="flex-1 overflow-y-auto space-y-2 pr-2" style="max-height: 65vh;">
        <div 
          v-for="(pregunta, idx) in formulario.preguntas" 
          :key="idx"
          class="border border-gray-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
        >
          <!-- Header compacto -->
          <div class="flex items-start gap-2 mb-2">
            <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
              {{ idx + 1 }}
            </span>
            <Select 
              v-model="pregunta.tipo"
              :options="tiposPreguntas"
              option-label="label"
              option-value="value"
              class="flex-1"
              size="small"
            />
            <Button 
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              @click="eliminarPregunta(idx)"
            />
          </div>

          <!-- Pregunta -->
          <InputText 
            v-model="pregunta.texto"
            placeholder="Escribe la pregunta..."
            class="w-full text-sm mb-2"
            size="small"
          />

          <!-- Opciones compactas -->
          <div v-if="pregunta.tipo === 'multiple'" class="space-y-1">
            <div v-for="(opcion, opIdx) in pregunta.opciones" :key="opIdx" class="flex gap-1 items-center">
              <span class="text-xs text-gray-400 dark:text-slate-500 w-4">{{ String.fromCharCode(65 + opIdx) }}</span>
              <InputText 
                v-model="opcion.texto"
                placeholder="Opción..."
                class="flex-1 text-xs"
                size="small"
              />
              <Button 
                v-if="opIdx === pregunta.opciones.length - 1 && pregunta.opciones.length < MAX_RESPUESTAS_MULTIPLE"
                icon="pi pi-plus"
                @click="agregarOpcion(idx)"
                rounded
                text
                size="small"
                severity="success"
              />
              <Button 
                v-else-if="pregunta.opciones.length > 1"
                icon="pi pi-times"
                @click="eliminarOpcion(idx, opIdx)"
                rounded
                text
                size="small"
                severity="danger"
              />
            </div>
          </div>
          <div v-else class="text-xs text-gray-500 dark:text-slate-400 italic">
            Respuesta abierta (texto libre)
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Footer sticky: Dirigida a, Notificaciones y Botones -->
    <div class="border-t border-gray-200 dark:border-slate-600 pt-2 mt-0 bg-white dark:bg-slate-900 flex-shrink-0">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!-- Resumen -->
          <div class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg p-2 border border-green-200 dark:border-green-800">
          <h4 class="font-medium text-xs text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Resumen
          </h4>
          <div class="space-y-0.5 text-xs text-gray-600 dark:text-slate-400">
            <div class="flex justify-between items-center">
              <span>Total:</span>
              <span class="font-bold text-blue-600 dark:text-blue-400">{{ formulario.preguntas.length }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Múltiple:
              </span>
              <span class="font-semibold text-purple-600 dark:text-purple-400">{{ preguntasMultiple }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                Abiertas:
              </span>
              <span class="font-semibold text-orange-600 dark:text-orange-400">{{ preguntasAbiertas }}</span>
            </div>
          </div>
        </div>

        <!-- Dirigida a -->
          <div class="bg-blue-50 dark:bg-blue-950 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
          <h4 class="font-medium text-xs text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Dirigida a
          </h4>

          <!-- Admin: selector de rol -->
          <template v-if="!esCoordinador">
            <Select
              v-model="formulario.rol_objetivo"
              :options="rolesObjetivo"
              option-label="label"
              option-value="value"
              placeholder="Todos"
              class="w-full"
              size="small"
            />
          </template>

          <!-- Coordinador: lista de sus usuarios con todos seleccionados -->
          <template v-else>
            <MultiSelect
              v-model="formulario.usuarios_destino"
              :options="usuariosCoordinados"
              option-label="nombre"
              option-value="id"
              placeholder="Selecciona usuarios"
              :max-selected-labels="2"
              selected-items-label="{0} usuarios seleccionados"
              class="w-full"
              size="small"
            >
              <template #option="{ option }">
                <span>{{ option.nombre }} {{ option.Apellidos }}</span>
              </template>
            </MultiSelect>
            <p v-if="formulario.usuarios_destino.length === 0" class="text-[10px] text-red-500 mt-0.5">Selecciona al menos un usuario</p>
            <p v-else class="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{{ formulario.usuarios_destino.length }} de {{ usuariosCoordinados.length }} usuarios</p>
          </template>

          <div class="mt-1">
            <label class="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-0.5">Máx. opciones</label>
            <InputNumber
              v-model="MAX_RESPUESTAS_MULTIPLE"
              class="w-full"
              :min="2"
              :max="10"
              size="small"
            />
          </div>
        </div>

        <!-- Notificaciones -->
          <div class="bg-purple-50 dark:bg-purple-950 rounded-lg p-2 border border-purple-200 dark:border-purple-800">
          <h4 class="font-medium text-xs text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notificar a
          </h4>
          <div class="flex flex-col gap-1">
            <!-- Admin: los tres roles -->
            <template v-if="!esCoordinador">
              <div class="flex items-center gap-2">
                <input type="checkbox" id="notif-admin" v-model="formulario.notificar_admins" class="rounded text-purple-600 focus:ring-purple-500" />
                <label for="notif-admin" class="text-xs text-gray-700 dark:text-slate-300 cursor-pointer">Administradores</label>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="notif-coord" v-model="formulario.notificar_coordinadores" class="rounded text-purple-600 focus:ring-purple-500" />
                <label for="notif-coord" class="text-xs text-gray-700 dark:text-slate-300 cursor-pointer">Coordinadores</label>
              </div>
            </template>
            <!-- Coordinador: solo puede notificar a los usuarios seleccionados -->
            <div class="flex items-center gap-2">
              <input type="checkbox" id="notif-users" v-model="formulario.notificar_usuarios" class="rounded text-purple-600 focus:ring-purple-500" />
              <label for="notif-users" class="text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                {{ esCoordinador ? 'Usuarios seleccionados' : 'Usuarios' }}
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="mt-2 flex gap-2 justify-end">
        <Button 
          label="Cancelar" 
          severity="secondary"
          @click="emit('cancelar')"
          size="small"
          outlined
        />
        <Button 
          label="Crear encuesta" 
          @click="crearEncuesta"
          :loading="cargando"
          :disabled="!formularioValido"
          size="small"
          icon="pi pi-check"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

import { showSuccess, showError } from '@services/toastService'

const props = defineProps({
  cargando: {
    type: Boolean,
    default: false
  },
  esCoordinador: {
    type: Boolean,
    default: false
  },
  usuariosCoordinados: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['crear', 'cancelar'])

const tiposPreguntas = [
  { label: 'Opción múltiple', value: 'multiple' },
  { label: 'Respuesta abierta', value: 'abierta' }
]

const rolesObjetivo = [
  { label: 'Todos', value: null },
  { label: 'Solo Administradores', value: 1 },
  { label: 'Solo Coordinadores', value: 2 },
  { label: 'Solo Usuarios', value: 3 }
]

const MAX_RESPUESTAS_MULTIPLE = ref(4)
const formulario = ref({
  titulo: '',
  descripcion: '',
  fecha_fin: new Date(),
  rol_objetivo: null,
  usuarios_destino: [],
  notificar_admins: true,
  notificar_coordinadores: true,
  notificar_usuarios: true,
  preguntas: []
})

// Al abrir con usuariosCoordinados cargados, pre-seleccionar todos
watch(() => props.usuariosCoordinados, (lista) => {
  if (props.esCoordinador && lista.length) {
    formulario.value.usuarios_destino = lista.map(u => u.id)
    formulario.value.notificar_usuarios = true
  }
}, { immediate: true })

const formularioValido = computed(() => {
  const base =
    formulario.value.titulo.trim() !== '' &&
    formulario.value.descripcion.trim() !== '' &&
    formulario.value.fecha_fin !== null &&
    formulario.value.preguntas.length > 0 &&
    formulario.value.preguntas.every(p =>
      p.texto.trim() !== '' &&
      (p.tipo === 'abierta' || (p.opciones && p.opciones.length > 0 && p.opciones.every(o => o.texto.trim() !== '')))
    )
  if (props.esCoordinador) {
    return base && formulario.value.usuarios_destino.length > 0
  }
  return base
})

const preguntasMultiple = computed(() => 
  formulario.value.preguntas.filter(p => p.tipo === 'multiple').length
)

const preguntasAbiertas = computed(() => 
  formulario.value.preguntas.filter(p => p.tipo === 'abierta').length
)

const agregarPregunta = () => {
  formulario.value.preguntas.push({
    texto: '',
    tipo: 'multiple',
    opciones: [{ texto: '' }]
  })
}



const eliminarPregunta = (idx) => {
  formulario.value.preguntas.splice(idx, 1)
}

const agregarOpcion = (preguntaIdx) => {
  formulario.value.preguntas[preguntaIdx].opciones.push({ texto: '' })
}

const eliminarOpcion = (preguntaIdx, opcionIdx) => {
  formulario.value.preguntas[preguntaIdx].opciones.splice(opcionIdx, 1)
}

const crearEncuesta = () => {
  if (formularioValido.value) {
    emit('crear', {
      ...formulario.value,
      fecha_fin: formulario.value.fecha_fin.toISOString().split('T')[0]
    })
  }
}
</script>

<style scoped>
:deep(.p-inputtext),
:deep(.p-inputtextarea),
:deep(.p-dropdown),
:deep(.p-calendar) {
  width: 100%;
}
</style>
