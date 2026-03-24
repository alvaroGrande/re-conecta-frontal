<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">

      <!-- Cabecera -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <i class="pi pi-shield"></i>
          Gestion de Roles y Permisos
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configura que puede ver y hacer cada rol en la plataforma. El rol
          <strong class="text-gray-700 dark:text-gray-300">Administrador</strong>
          siempre tiene acceso total y no puede modificarse.
        </p>
      </div>

      <!-- Buscador -->
      <PermisoBuscador v-model="busqueda" :total="totalFiltrados" />

      <!-- Cargando -->
      <div v-if="cargando" class="flex justify-center py-20">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      </div>

      <!-- Sin resultados -->
      <div
        v-else-if="busqueda.trim() && gruposFiltrados.length === 0"
        class="text-center py-16 text-gray-400 dark:text-gray-500"
      >
        <i class="pi pi-search text-3xl mb-3 block"></i>
        <p>Sin resultados para <strong class="text-gray-600 dark:text-gray-300">{{ busqueda }}</strong></p>
        <button class="mt-2 text-sm text-blue-500 hover:underline" @click="busqueda = ''">Limpiar</button>
      </div>

      <!-- Tabla -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-slate-700">
              <th class="text-left py-4 px-6 font-semibold text-gray-600 dark:text-gray-300 min-w-70">
                Permiso
              </th>
              <th class="py-4 px-6 text-center w-32">
                <div class="flex flex-col items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <i class="pi pi-crown text-lg"></i>
                  <span class="font-semibold text-xs">Administrador</span>
                  <span class="text-xs text-gray-400 font-normal flex items-center gap-1">
                    <i class="pi pi-lock text-[10px]"></i> fijo
                  </span>
                </div>
              </th>
              <th class="py-4 px-6 text-center w-32">
                <div class="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400">
                  <i class="pi pi-briefcase text-lg"></i>
                  <span class="font-semibold text-xs">Coordinador</span>
                </div>
              </th>
              <th class="py-4 px-6 text-center w-32">
                <div class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
                  <i class="pi pi-user text-lg"></i>
                  <span class="font-semibold text-xs">Usuario</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <template v-for="grupo in gruposFiltrados" :key="grupo.label">

              <!-- Cabecera de grupo colapsable -->
              <tr
                class="bg-gray-50 dark:bg-slate-700/50 cursor-pointer select-none
                       hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                @click="toggleGrupo(grupo.label)"
              >
                <td colspan="4" class="py-2.5 px-6">
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-2 font-semibold text-xs uppercase
                                 tracking-wider text-gray-500 dark:text-gray-400">
                      <i :class="grupo.icon"></i>
                      {{ grupo.label }}
                      <span class="font-normal normal-case tracking-normal ml-1 text-gray-400">({{ grupo.permisos.length }})</span>
                    </span>
                    <i class="text-[10px] text-gray-400 dark:text-gray-500"
                       :class="gruposAbiertos[grupo.label] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                  </div>
                </td>
              </tr>

              <!-- Filas de permisos -->
              <template v-if="gruposAbiertos[grupo.label]">
                <tr
                  v-for="item in grupo.permisos"
                  :key="item.permiso"
                  class="border-t border-gray-100 dark:border-slate-700/40
                         hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td class="py-3 px-6 text-gray-700 dark:text-gray-300">
                    <div class="flex flex-col gap-0.5">
                      <span v-html="resaltar(item.descripcion)"></span>
                      <code class="text-[10px] text-gray-400 dark:text-gray-500"
                            v-html="resaltar(item.permiso)"></code>
                    </div>
                  </td>
                  <td class="py-3 px-6 text-center">
                    <input type="checkbox" checked disabled
                           class="w-4 h-4 cursor-not-allowed opacity-40"
                           title="El Administrador siempre tiene todos los permisos" />
                  </td>
                  <td class="py-3 px-6 text-center">
                    <input type="checkbox"
                           :checked="permisosEditados[2].has(item.permiso)"
                           class="w-4 h-4 cursor-pointer accent-blue-600"
                           @change="togglePermiso(2, item.permiso)" />
                  </td>
                  <td class="py-3 px-6 text-center">
                    <input type="checkbox"
                           :checked="permisosEditados[3].has(item.permiso)"
                           class="w-4 h-4 cursor-pointer accent-blue-600"
                           @change="togglePermiso(3, item.permiso)" />
                  </td>
                </tr>
              </template>

            </template>
          </tbody>
        </table>
      </div>

      <!-- Acciones -->
      <div v-if="!cargando" class="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <i class="pi pi-info-circle"></i>
          Los cambios afectan a todos los usuarios activos con ese rol.
        </p>
        <div class="flex gap-3">
          <Button label="Restaurar valores por defecto" severity="secondary" outlined
                  icon="pi pi-refresh" :loading="guardando" @click="confirmarReset" />
          <Button label="Guardar cambios" icon="pi pi-save"
                  :loading="guardando" @click="guardar" />
        </div>
      </div>

      <ConfirmDialog />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import PermisoBuscador from '@features/RolesPermisos/PermisoBuscador.vue'
import { getRolesPermisos, updateRolesPermisos, resetRolesPermisos, getPermisosDisponibles } from '@services/rolesPermisos'
import { showSuccess, showError } from '@services/toastService'

// ── Estado ─────────────────────────────────────────────────────────────────────

const cargando  = ref(true)
const guardando = ref(false)
const busqueda  = ref('')

/**
 * Catalogo plano desde la BD: [{ permiso, descripcion, grupo, grupo_icono, orden_grupo, orden }]
 * La tabla permisos_catalogo en Supabase es la fuente de verdad.
 */
const catalogo = ref([])

// { [label: string]: boolean } — true = grupo abierto
const gruposAbiertos = reactive({})

// { 2: Set<string>, 3: Set<string> }
const permisosEditados = reactive({ 2: new Set(), 3: new Set() })

const confirm = useConfirm()

// ── Agrupacion desde la BD ──────────────────────────────────────────────────────

/**
 * Convierte el array plano de la BD en grupos { label, icon, permisos[] }
 * ordenados segun orden_grupo y orden.
 */
const catalogoGrupos = computed(() => {
  const mapa = new Map()
  for (const item of catalogo.value) {
    if (!mapa.has(item.grupo)) {
      mapa.set(item.grupo, {
        label: item.grupo,
        icon: item.grupo_icono,
        orden: item.orden_grupo,
        permisos: [],
      })
    }
    mapa.get(item.grupo).permisos.push({
      permiso: item.permiso,
      descripcion: item.descripcion,
    })
  }
  return [...mapa.values()].sort((a, b) => a.orden - b.orden)
})

// ── Busqueda ────────────────────────────────────────────────────────────────────

function resaltar(texto) {
  const term = busqueda.value.trim()
  if (!term) return texto
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return texto.replace(re, '<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">$1</mark>')
}

const gruposFiltrados = computed(() => {
  const term = busqueda.value.trim().toLowerCase()
  if (!term) return catalogoGrupos.value

  return catalogoGrupos.value
    .map(g => ({
      ...g,
      permisos: g.permisos.filter(
        p => p.permiso.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term)
      ),
    }))
    .filter(g => g.permisos.length > 0)
})

const totalFiltrados = computed(() =>
  gruposFiltrados.value.reduce((acc, g) => acc + g.permisos.length, 0)
)

// ── Colapso ─────────────────────────────────────────────────────────────────────

function toggleGrupo(label) {
  if (busqueda.value.trim()) return
  gruposAbiertos[label] = !gruposAbiertos[label]
}

// Al buscar, abrir automaticamente los grupos que tengan resultados
watch(busqueda, (term) => {
  if (term.trim()) {
    for (const g of gruposFiltrados.value) {
      gruposAbiertos[g.label] = true
    }
  }
})

// ── Permisos ────────────────────────────────────────────────────────────────────

function togglePermiso(rol, permiso) {
  const s = permisosEditados[rol]
  if (s.has(permiso)) s.delete(permiso)
  else s.add(permiso)
}

// ── Carga ───────────────────────────────────────────────────────────────────────

async function cargarPermisos() {
  try {
    cargando.value = true

    const [catalogoData, permisosData] = await Promise.all([
      getPermisosDisponibles(),   // BD: tabla permisos_catalogo
      getRolesPermisos(),         // BD: tabla roles_permisos
    ])

    catalogo.value = catalogoData

    permisosEditados[2] = new Set(permisosData['2'] ?? [])
    permisosEditados[3] = new Set(permisosData['3'] ?? [])

    // Cerrar todos los grupos por defecto tras cargar el catalogo
    for (const g of catalogoGrupos.value) {
      gruposAbiertos[g.label] = false
    }
  } catch (err) {
    showError('No se pudieron cargar los permisos')
    console.error(err)
  } finally {
    cargando.value = false
  }
}

// ── Acciones ────────────────────────────────────────────────────────────────────

async function guardar() {
  try {
    guardando.value = true
    await updateRolesPermisos({
      2: [...permisosEditados[2]],
      3: [...permisosEditados[3]],
    })
    showSuccess('Guardado', 'Los permisos se han actualizado correctamente.')
  } catch {
    showError('No se pudieron guardar los permisos')
  } finally {
    guardando.value = false
  }
}

function confirmarReset() {
  confirm.require({
    message: 'Deseas restaurar los permisos de todos los roles a los valores por defecto? Esta accion no se puede deshacer.',
    header: 'Restaurar valores por defecto',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Si, restaurar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        guardando.value = true
        await resetRolesPermisos()
        showSuccess('Restaurado', 'Los permisos han sido restaurados a los valores por defecto.')
        await cargarPermisos()
      } catch {
        showError('No se pudieron restaurar los permisos')
      } finally {
        guardando.value = false
      }
    },
  })
}

onMounted(cargarPermisos)
</script>