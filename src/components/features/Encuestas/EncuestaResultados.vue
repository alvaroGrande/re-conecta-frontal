<template>
  <div class="space-y-4">
    <p v-if="yaRespondida" class="text-blue-600 text-sm mb-4 bg-blue-50 p-2 rounded">
      ✓ Ya has respondido esta encuesta
    </p>

    <div v-if="resultados" class="space-y-6">
      <div v-for="pregunta in encuesta.preguntas" :key="pregunta.id">
        <h4 class="font-medium text-gray-800 mb-3">{{ pregunta.texto }}</h4>
        
        <!-- Resultados múltiple choice -->
        <div v-if="pregunta.tipo === 'multiple'" class="space-y-3">
          <div v-for="opcion in pregunta.opciones" :key="opcion.id">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-700">{{ opcion.texto }}</span>
              <span class="text-xs font-medium text-gray-600">
                {{ calcularPorcentaje(pregunta.id, opcion.id) }}% ({{ obtenerVotos(pregunta.id, opcion.id) }})
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all"
                :style="{ width: calcularPorcentaje(pregunta.id, opcion.id) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Resultados abiertas -->
        <div v-else-if="pregunta.tipo === 'abierta'" class="space-y-2 max-h-60 overflow-y-auto">
          <div v-if="resultados[pregunta.id]?.respuestas && resultados[pregunta.id].respuestas.length > 0">
            <p
v-for="(respuesta, idx) in resultados[pregunta.id].respuestas.slice(0, 5)" 
               :key="idx" 
               class="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-300"
>
              "{{ respuesta }}"
            </p>
            <p v-if="resultados[pregunta.id].respuestas.length > 5" class="text-xs text-gray-500 italic mt-2">
              +{{ resultados[pregunta.id].respuestas.length - 5 }} respuestas más
            </p>
          </div>
          <p v-else class="text-sm text-gray-500 italic">Sin respuestas aún</p>
        </div>
      </div>
    </div>

    <Button 
      label="Cerrar" 
      severity="secondary"
      @click="emit('cerrar')"
      class="w-full mt-6"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  },
  resultados: {
    type: Object,
    required: true
  },
  yaRespondida: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cerrar'])

const calcularPorcentaje = (preguntaId, opcionId) => {
  if (!props.resultados || !props.resultados[preguntaId]) return 0
  
  const resultado = props.resultados[preguntaId]
  const votos = resultado.opciones?.[opcionId] || 0
  const total = resultado.total || 1
  
  return Math.round((votos / total) * 100)
}

const obtenerVotos = (preguntaId, opcionId) => {
  if (!props.resultados || !props.resultados[preguntaId]) return 0
  
  const resultado = props.resultados[preguntaId]
  return resultado.opciones?.[opcionId] || 0
}
</script>

<style scoped>
div :deep(.p-button) {
  width: 100%;
}
</style>
