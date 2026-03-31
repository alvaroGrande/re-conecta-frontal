<script setup>
import { computed } from 'vue'
import { useLOVLabel } from '@/composables/useLOV.js'

const props = defineProps({
  tipo: { type: String, required: true },
  variante: { type: String, required: true }
})

const nombreTipo     = useLOVLabel('tipo_curso', computed(() => props.tipo))
const nombreVariante = useLOVLabel('tipo_pago',  computed(() => props.variante))

// Colores por código (los códigos no cambian aunque el nombre cambie)
const colorClase = computed(() => {
  const t = props.tipo
  const v = props.variante
  if (t === 'online'     && v === 'gratis') return 'bg-green-100 text-green-800'
  if (t === 'online'     && v === 'pago')   return 'bg-green-200 text-green-900'
  if (t === 'presencial' && v === 'gratis') return 'bg-blue-100 text-blue-800'
  if (t === 'presencial' && v === 'pago')   return 'bg-blue-200 text-blue-900'
  return 'bg-gray-100 text-gray-800'
})
</script>

<template>
  <span class="px-2 py-1 rounded-full text-sm font-semibold capitalize" :class="colorClase">
    {{ nombreTipo }} - {{ nombreVariante }}
  </span>
</template>
