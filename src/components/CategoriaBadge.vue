<script setup>
import { TIPO_PAGO_CURSO, TIPO_CURSO } from '../helpers/constants.js'
defineProps({
  tipo: {
    type: String,
    required: true // 'Presencial' o 'Online'
  },
  variante: {
    type: String,
    required: true // 'Gratis' o 'Pago'
  }
})

// Devuelve clases de color según tipo y variante
const colorClase = (tipo, variante) => {
  console.log('Tipo:', tipo, 'Variante:', variante, TIPO_PAGO_CURSO.GRATIS, TIPO_CURSO)
  if (tipo === TIPO_CURSO.ONLINE && variante === TIPO_PAGO_CURSO.GRATIS) return 'bg-green-100 text-green-800'
  if (tipo === TIPO_CURSO.ONLINE && variante === TIPO_PAGO_CURSO.PAGO) return 'bg-green-200 text-green-900'
  if (tipo === TIPO_CURSO.PRESENCIAL && variante ===TIPO_PAGO_CURSO.GRATIS) return 'bg-blue-100 text-blue-800'
  if (tipo === TIPO_CURSO.PRESENCIAL && variante === TIPO_PAGO_CURSO.PAGO) return 'bg-blue-200 text-blue-900'
  return 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <span class="px-2 py-1 rounded-full text-sm font-semibold capitalize" :class="colorClase(tipo, variante)">
    {{ tipo }} - {{ variante }}
  </span>
</template>
