<script setup>
import { ref, onMounted } from 'vue'
import {
  getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria,
  crearValor, actualizarValor, eliminarValor, reordenarValores,
} from '@services/lov.js'
import { showSuccess, showError } from '@services/toastService'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'

// ─── Estado ─────────────────────────────────────────────────────────────────
const categorias       = ref([])
const cargando         = ref(false)
const categoriaActiva  = ref(null)

// Modal categoría
const modalCat   = ref(false)
const modoCat    = ref('crear') // 'crear' | 'editar'
const formCat    = ref({ codigo: '', nombre: '', descripcion: '' })
const guardandoCat = ref(false)

// Modal valor
const modalVal   = ref(false)
const modoVal    = ref('crear')
const formVal    = ref({ codigo: '', nombre: '', orden: 0 })
const valorEditando = ref(null)
const guardandoVal  = ref(false)

// ─── Carga inicial ───────────────────────────────────────────────────────────
async function cargar() {
  cargando.value = true
  try {
    categorias.value = await getCategorias()
    if (categorias.value.length && !categoriaActiva.value)
      categoriaActiva.value = categorias.value[0]
    else if (categoriaActiva.value)
      // refrescar el objeto activo con datos nuevos
      categoriaActiva.value = categorias.value.find(c => c.id === categoriaActiva.value.id) ?? categorias.value[0]
  } catch { showError('Error al cargar LOVs') }
  finally { cargando.value = false }
}

onMounted(cargar)

// ─── Categorías ──────────────────────────────────────────────────────────────
function abrirCrearCat() {
  modoCat.value = 'crear'
  formCat.value = { codigo: '', nombre: '', descripcion: '' }
  modalCat.value = true
}

function abrirEditarCat(cat) {
  modoCat.value = 'editar'
  formCat.value = { ...cat }
  modalCat.value = true
}

async function guardarCat() {
  if (!formCat.value.nombre || !formCat.value.codigo) return
  guardandoCat.value = true
  try {
    if (modoCat.value === 'crear') {
      await crearCategoria(formCat.value)
      showSuccess('Categoría creada')
    } else {
      await actualizarCategoria(formCat.value.id, {
        nombre: formCat.value.nombre,
        descripcion: formCat.value.descripcion,
        activo: formCat.value.activo,
      })
      showSuccess('Categoría actualizada')
    }
    modalCat.value = false
    await cargar()
  } catch (e) {
    showError(e?.response?.data?.error ?? 'Error al guardar')
  } finally { guardandoCat.value = false }
}

async function borrarCat(cat) {
  if (!confirm(`¿Eliminar la categoría "${cat.nombre}" y todos sus valores?`)) return
  try {
    await eliminarCategoria(cat.id)
    showSuccess('Categoría eliminada')
    if (categoriaActiva.value?.id === cat.id) categoriaActiva.value = null
    await cargar()
  } catch (e) {
    showError(e?.response?.data?.error ?? 'Error al eliminar')
  }
}

// ─── Valores ─────────────────────────────────────────────────────────────────
function abrirCrearVal() {
  modoVal.value = 'crear'
  formVal.value = { codigo: '', nombre: '', orden: (categoriaActiva.value?.valores?.length ?? 0) + 1 }
  valorEditando.value = null
  modalVal.value = true
}

function abrirEditarVal(val) {
  modoVal.value = 'editar'
  formVal.value = { ...val }
  valorEditando.value = val
  modalVal.value = true
}

async function guardarVal() {
  if (!formVal.value.nombre || !formVal.value.codigo) return
  guardandoVal.value = true
  try {
    if (modoVal.value === 'crear') {
      await crearValor(categoriaActiva.value.id, formVal.value)
      showSuccess('Valor añadido')
    } else {
      await actualizarValor(formVal.value.id, {
        nombre: formVal.value.nombre,
        orden: formVal.value.orden,
        activo: formVal.value.activo,
      })
      showSuccess('Valor actualizado')
    }
    modalVal.value = false
    await cargar()
  } catch (e) {
    showError(e?.response?.data?.error ?? 'Error al guardar')
  } finally { guardandoVal.value = false }
}

async function borrarVal(val) {
  if (!confirm(`¿Eliminar el valor "${val.nombre}"?`)) return
  try {
    await eliminarValor(val.id)
    showSuccess('Valor eliminado')
    await cargar()
  } catch (e) {
    showError(e?.response?.data?.error ?? 'Error al eliminar')
  }
}

async function moverValor(val, direccion) {
  const valores = [...(categoriaActiva.value?.valores ?? [])]
  const idx = valores.findIndex(v => v.id === val.id)
  const swapIdx = idx + direccion
  if (swapIdx < 0 || swapIdx >= valores.length) return

  const items = valores.map((v, i) => {
    if (i === idx)     return { id: v.id, orden: swapIdx + 1 }
    if (i === swapIdx) return { id: v.id, orden: idx + 1 }
    return { id: v.id, orden: i + 1 }
  })
  try {
    await reordenarValores(categoriaActiva.value.id, items)
    await cargar()
  } catch { showError('Error al reordenar') }
}
</script>

<template>
  <div class="flex gap-4 h-full min-h-[500px]">

    <!-- ── Panel izquierdo: lista de categorías ───────────────────────────── -->
    <aside class="w-64 flex-shrink-0 flex flex-col gap-2">
      <div class="flex items-center justify-between mb-1">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Categorías</h2>
        <button
          class="text-xs px-2 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50"
          @click="abrirCrearCat"
        ><i class="pi pi-plus mr-1" />Nueva</button>
      </div>

      <div v-if="cargando" class="text-gray-400 text-sm">Cargando…</div>

      <button
        v-for="cat in categorias"
        :key="cat.id"
        class="text-left px-3 py-2 rounded-lg border text-sm transition-colors"
        :class="categoriaActiva?.id === cat.id
          ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
          : 'border-gray-200 hover:bg-gray-50 text-gray-700'"
        @click="categoriaActiva = cat"
      >
        <p class="font-medium truncate">{{ cat.nombre }}</p>
        <p class="text-xs text-gray-400 font-mono">{{ cat.codigo }}</p>
      </button>
    </aside>

    <!-- ── Panel derecho: valores de la categoría activa ─────────────────── -->
    <section class="flex-1 flex flex-col gap-3">
      <template v-if="categoriaActiva">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-800">{{ categoriaActiva.nombre }}</h2>
            <p v-if="categoriaActiva.descripcion" class="text-sm text-gray-500">{{ categoriaActiva.descripcion }}</p>
            <code class="text-xs text-gray-400">{{ categoriaActiva.codigo }}</code>
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm rounded border border-blue-300 text-blue-600 hover:bg-blue-50"
              @click="abrirEditarCat(categoriaActiva)"><i class="pi pi-pencil mr-1" />Editar</button>
            <button class="px-3 py-1 text-sm rounded border border-red-300 text-red-500 hover:bg-red-50"
              @click="borrarCat(categoriaActiva)"><i class="pi pi-trash mr-1" />Eliminar</button>
            <button class="px-3 py-1 text-sm rounded border border-green-400 text-green-600 hover:bg-green-50"
              @click="abrirCrearVal"><i class="pi pi-plus mr-1" />Nuevo valor</button>
          </div>
        </div>

        <!-- Tabla de valores -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th class="px-4 py-2 text-left w-10">#</th>
                <th class="px-4 py-2 text-left">Nombre</th>
                <th class="px-4 py-2 text-left">Código</th>
                <th class="px-4 py-2 text-center">Activo</th>
                <th class="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!categoriaActiva.valores?.length">
                <td colspan="5" class="px-4 py-6 text-center text-gray-400">Sin valores. Añade el primero.</td>
              </tr>
              <tr
                v-for="(val, idx) in categoriaActiva.valores"
                :key="val.id"
                class="border-t border-gray-100 hover:bg-gray-50"
                :class="!val.activo ? 'opacity-50' : ''"
              >
                <td class="px-4 py-2 text-gray-400 text-xs">
                  <div class="flex flex-col gap-0.5">
                    <button class="hover:text-gray-700 disabled:opacity-30" :disabled="idx === 0"
                      @click="moverValor(val, -1)"><i class="pi pi-chevron-up text-[10px]" /></button>
                    <button class="hover:text-gray-700 disabled:opacity-30"
                      :disabled="idx === categoriaActiva.valores.length - 1"
                      @click="moverValor(val, 1)"><i class="pi pi-chevron-down text-[10px]" /></button>
                  </div>
                </td>
                <td class="px-4 py-2 font-medium text-gray-800">{{ val.nombre }}</td>
                <td class="px-4 py-2"><code class="text-xs bg-gray-100 px-1 rounded">{{ val.codigo }}</code></td>
                <td class="px-4 py-2 text-center">
                  <span :class="val.activo ? 'text-green-500' : 'text-gray-300'">
                    <i :class="val.activo ? 'pi pi-check-circle' : 'pi pi-times-circle'" />
                  </span>
                </td>
                <td class="px-4 py-2 text-right flex justify-end gap-2">
                  <button class="text-blue-500 hover:text-blue-700" @click="abrirEditarVal(val)">
                    <i class="pi pi-pencil text-xs" />
                  </button>
                  <button class="text-red-400 hover:text-red-600" @click="borrarVal(val)">
                    <i class="pi pi-trash text-xs" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        Selecciona una categoría para ver sus valores
      </div>
    </section>
  </div>

  <!-- ── Modal Categoría ──────────────────────────────────────────────────── -->
  <Dialog
    v-model:visible="modalCat"
    :header="modoCat === 'crear' ? 'Nueva categoría LOV' : 'Editar categoría'"
    :modal="true" :style="{ width: '420px' }"
  >
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Código <span class="text-red-400">*</span></label>
        <InputText
          v-model="formCat.codigo"
          :disabled="modoCat === 'editar'"
          placeholder="ej: tipo_curso"
          class="w-full font-mono text-sm"
        />
        <p v-if="modoCat === 'crear'" class="text-xs text-gray-400">Solo letras, números y _. No se puede cambiar después.</p>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Nombre <span class="text-red-400">*</span></label>
        <InputText v-model="formCat.nombre" placeholder="ej: Tipo de curso" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Descripción</label>
        <Textarea v-model="formCat.descripcion" rows="2" placeholder="Descripción opcional…" class="w-full" />
      </div>
      <div v-if="modoCat === 'editar'" class="flex items-center gap-3">
        <label class="text-xs font-semibold text-gray-500">Activo</label>
        <ToggleSwitch v-model="formCat.activo" />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="modalCat = false" :disabled="guardandoCat" />
        <Button
          :label="modoCat === 'crear' ? 'Crear' : 'Guardar'"
          :loading="guardandoCat"
          :disabled="!formCat.nombre || !formCat.codigo"
          @click="guardarCat"
        />
      </div>
    </div>
  </Dialog>

  <!-- ── Modal Valor ──────────────────────────────────────────────────────── -->
  <Dialog
    v-model:visible="modalVal"
    :header="modoVal === 'crear' ? 'Nuevo valor' : 'Editar valor'"
    :modal="true" :style="{ width: '380px' }"
  >
    <div class="flex flex-col gap-4 pt-2">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Código <span class="text-red-400">*</span></label>
        <InputText
          v-model="formVal.codigo"
          :disabled="modoVal === 'editar'"
          placeholder="ej: presencial"
          class="w-full font-mono text-sm"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Nombre <span class="text-red-400">*</span></label>
        <InputText v-model="formVal.nombre" placeholder="ej: Presencial" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-500">Orden</label>
        <InputText v-model.number="formVal.orden" type="number" min="1" class="w-full" />
      </div>
      <div v-if="modoVal === 'editar'" class="flex items-center gap-3">
        <label class="text-xs font-semibold text-gray-500">Activo</label>
        <ToggleSwitch v-model="formVal.activo" />
      </div>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="modalVal = false" :disabled="guardandoVal" />
        <Button
          :label="modoVal === 'crear' ? 'Añadir' : 'Guardar'"
          :loading="guardandoVal"
          :disabled="!formVal.nombre || !formVal.codigo"
          @click="guardarVal"
        />
      </div>
    </div>
  </Dialog>
</template>
