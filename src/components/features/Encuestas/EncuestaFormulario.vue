<template>
  <div class="space-y-4">
    <p class="text-gray-700 mb-6">{{ encuesta.descripcion }}</p>
    
    <div class="space-y-4">
      <div v-for="pregunta in encuesta.preguntas" :key="pregunta.id">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ pregunta.texto }}
          <span v-if="pregunta.tipo === 'multiple'" class="text-xs text-gray-500 font-normal">(Puedes seleccionar múltiples)</span>
        </label>
        
        <!-- Opción múltiple -->
        <div v-if="pregunta.tipo === 'multiple'" class="space-y-2">
          <label v-for="opcion in pregunta.opciones" :key="opcion.id" class="flex items-center">
            <input 
              :checked="Array.isArray(respuestas[pregunta.id]) && respuestas[pregunta.id].includes(opcion.id)"
              @change="cambiarOpcionMultiple(pregunta.id, opcion.id, $event.target.checked)"
              type="checkbox"
              class="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span class="ml-2 text-gray-700">{{ opcion.texto }}</span>
          </label>
        </div>

        <!-- Abierta -->
        <textarea 
          v-else-if="pregunta.tipo === 'abierta'"
          v-model="respuestas[pregunta.id]"
          placeholder="Escribe tu respuesta..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows="3"
        />
      </div>
    </div>

    <div class="flex gap-2 mt-6">
      <Button 
        label="Cancelar" 
        severity="secondary"
        @click="emit('cancelar')"
        class="flex-1"
      />
      <Button 
        label="Enviar" 
        @click="enviar"
        :loading="cargando"
        class="flex-1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  },
  cargando: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['enviar', 'cancelar'])

const respuestas = ref({})

const cambiarOpcionMultiple = (preguntaId, opcionId, checked) => {
  if (!Array.isArray(respuestas.value[preguntaId])) {
    respuestas.value[preguntaId] = []
  }
  
  if (checked) {
    respuestas.value[preguntaId].push(opcionId)
  } else {
    respuestas.value[preguntaId] = respuestas.value[preguntaId].filter(id => id !== opcionId)
  }
}

const enviar = () => {
  emit('enviar', respuestas.value)
}
</script>
