<script setup>
import { ref, computed, watch } from "vue"
import Dialog  from "primevue/dialog"
import Button  from "primevue/button"
import { useConfirm } from "primevue/useconfirm"
import { getDocumentos, subirDocumentoPDF, eliminarDocumentoPDF } from "@services/talleres"
import { showSuccess, showError } from "@services/toastService"

const props = defineProps({
  visible:      { type: Boolean, default: false },
  taller:       { type: Object,  default: null  },
  esAdmin:      { type: Boolean, default: false },
  esSupervisor: { type: Boolean, default: false },
})
const emit    = defineEmits(["update:visible"])
const confirm = useConfirm()

const documentos    = ref([])
const cargando      = ref(false)
const subiendo      = ref(false)
const progreso      = ref(0)
const archivoSel    = ref(null)
const fileInputRef  = ref(null)

const puedeSubir = computed(() => props.esAdmin || props.esSupervisor)

watch(() => props.visible, async (val) => {
  if (val && props.taller) await cargarDocumentos()
})

async function cargarDocumentos() {
  cargando.value = true
  try {
    documentos.value = await getDocumentos(props.taller.id)
  } catch {
    showError("Error al cargar los documentos")
  } finally {
    cargando.value = false
  }
}

function seleccionarArchivo(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.type !== "application/pdf") {
    showError("Solo se permiten archivos PDF")
    e.target.value = ""
    return
  }
  if (file.size > 100 * 1024 * 1024) {
    showError("El archivo no debe superar los 100 MB")
    e.target.value = ""
    return
  }
  archivoSel.value = file
}

async function subirPDF() {
  if (!archivoSel.value) return
  subiendo.value = true
  progreso.value = 0
  try {
    const doc = await subirDocumentoPDF(
      props.taller.id,
      archivoSel.value,
      (p) => { progreso.value = Math.round(p * 100) }
    )
    documentos.value.push(doc)
    archivoSel.value = null
    if (fileInputRef.value) fileInputRef.value.value = ""
    showSuccess("PDF subido correctamente")
  } catch {
    showError("Error al subir el PDF")
  } finally {
    subiendo.value = false
    progreso.value = 0
  }
}

function confirmarEliminar(doc) {
  confirm.require({
    header: "Eliminar documento",
    message: `¿Eliminar "${doc.nombre}"? Esta acción no se puede deshacer.`,
    icon: "pi pi-exclamation-triangle",
    rejectLabel: "Cancelar",
    acceptLabel: "Eliminar",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await eliminarDocumentoPDF(props.taller.id, doc.id)
        documentos.value = documentos.value.filter((d) => d.id !== doc.id)
        showSuccess("Documento eliminado")
      } catch {
        showError("Error al eliminar el documento")
      }
    },
  })
}

function formatBytes(bytes) {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="`Documentos — ${taller?.titulo ?? ''}`"
    :modal="true"
    :style="{ width: '95%', maxWidth: '560px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- Cargando -->
    <div v-if="cargando" class="py-10 text-center text-gray-400">
      <i class="pi pi-spin pi-spinner text-2xl mb-2 block"></i>
      Cargando documentos…
    </div>

    <div v-else>
      <!-- Lista de documentos -->
      <ul v-if="documentos.length" class="divide-y divide-gray-100 mb-4">
        <li
          v-for="doc in documentos"
          :key="doc.id"
          class="flex items-center gap-3 py-3"
        >
          <i class="pi pi-file-pdf text-red-500 text-xl flex-shrink-0"></i>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{{ doc.nombre }}</span>
            <span class="text-xs text-gray-400">{{ formatBytes(doc.tamano) }}</span>
          </span>
          <a
            :href="doc.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-blue-300
                   text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <i class="pi pi-download text-[11px]"></i> Descargar
          </a>
          <button
            v-if="esAdmin"
            class="flex-shrink-0 px-2 py-1 text-xs rounded border border-red-300 text-red-500
                   hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            @click="confirmarEliminar(doc)"
          >
            <i class="pi pi-trash"></i>
          </button>
        </li>
      </ul>
      <p v-else class="text-sm text-gray-400 italic mb-4">
        No hay documentos adjuntos a este taller.
      </p>

      <!-- Subir PDF (admin / coordinador) -->
      <div v-if="puedeSubir" class="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-3">
        <p class="text-sm font-medium text-gray-700 dark:text-slate-300">Adjuntar PDF <span class="text-xs text-gray-400 font-normal">(máx. 100 MB)</span></p>

        <input
          ref="fileInputRef"
          type="file"
          accept="application/pdf"
          class="hidden"
          @change="seleccionarArchivo"
        />

        <div class="flex items-center gap-2 flex-wrap">
          <Button
            icon="pi pi-folder-open"
            label="Seleccionar PDF"
            size="small"
            severity="secondary"
            :disabled="subiendo"
            @click="fileInputRef.click()"
          />
          <span v-if="archivoSel" class="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[200px]">
            {{ archivoSel.name }}
          </span>
        </div>

        <div v-if="archivoSel" class="space-y-2">
          <!-- Barra de progreso -->
          <div v-if="subiendo">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subiendo…</span><span>{{ progreso }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
              <div
                class="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                :style="{ width: progreso + '%' }"
              ></div>
            </div>
          </div>
          <Button
            icon="pi pi-upload"
            label="Subir PDF"
            size="small"
            severity="success"
            :loading="subiendo"
            @click="subirPDF"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
