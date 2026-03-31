import api from './api'

// ─── Caché en memoria del frontend ──────────────────────────────────────────
const cache = new Map() // codigo → valores[]

export function invalidarCacheLOV(codigo) {
  if (codigo) cache.delete(codigo)
  else cache.clear()
}

// ── Obtener valores de un LOV (con caché) ────────────────────────────────────
export async function getLOV(codigo) {
  if (cache.has(codigo)) return cache.get(codigo)
  const { data } = await api.get(`/lov/${codigo}`)
  cache.set(codigo, data)
  return data
}

// ── Admin: categorías completas ───────────────────────────────────────────────
export async function getCategorias() {
  const { data } = await api.get('/lov/')
  return data
}

// ── Admin: CRUD categorías ────────────────────────────────────────────────────
export async function crearCategoria(payload) {
  const { data } = await api.post('/lov/', payload)
  invalidarCacheLOV()
  return data
}

export async function actualizarCategoria(id, payload) {
  const { data } = await api.put(`/lov/${id}`, payload)
  invalidarCacheLOV()
  return data
}

export async function eliminarCategoria(id) {
  const { data } = await api.delete(`/lov/${id}`)
  invalidarCacheLOV()
  return data
}

// ── Admin: CRUD valores ───────────────────────────────────────────────────────
export async function crearValor(categoriaId, payload) {
  const { data } = await api.post(`/lov/${categoriaId}/valores`, payload)
  invalidarCacheLOV()
  return data
}

export async function actualizarValor(id, payload) {
  const { data } = await api.put(`/lov/valores/${id}`, payload)
  invalidarCacheLOV()
  return data
}

export async function eliminarValor(id) {
  const { data } = await api.delete(`/lov/valores/${id}`)
  invalidarCacheLOV()
  return data
}

export async function reordenarValores(categoriaId, items) {
  const { data } = await api.post(`/lov/${categoriaId}/valores/reordenar`, { items })
  invalidarCacheLOV()
  return data
}
