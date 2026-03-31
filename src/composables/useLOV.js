import { ref, computed, isRef } from 'vue'
import { getLOV } from '@services/lov.js'

// Cache reactiva compartida entre todas las instancias (nivel módulo)
const store = {}

function useLOV(codigo) {
  if (!store[codigo]) {
    store[codigo] = ref([])
    getLOV(codigo).then(data => { store[codigo].value = data })
  }
  return store[codigo]
}

/**
 * Devuelve un computed con el nombre del valor LOV.
 * Mientras carga, devuelve el código como fallback.
 * codigoValor puede ser un string, ref o computed.
 */
export function useLOVLabel(categoria, codigoValor) {
  const lista = useLOV(categoria)
  return computed(() => {
    const codigo = isRef(codigoValor) ? codigoValor.value : codigoValor
    return lista.value.find(v => v.codigo === codigo)?.nombre ?? codigo
  })
}

/**
 * Devuelve la lista reactiva de valores de un LOV.
 * Útil para poblar <Select> con datos siempre actualizados.
 */
export function useLOVOpciones(categoria) {
  const lista = useLOV(categoria)
  return computed(() => lista.value.map(v => ({ name: v.nombre, code: v.codigo })))
}
