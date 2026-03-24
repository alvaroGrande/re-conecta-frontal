<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Cabecera -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">{{ $t('profile.title') }}</h1>
        <p class="text-gray-600 dark:text-slate-400 mt-2">{{ $t('profile.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tarjeta de Foto de Perfil -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">{{ $t('profile.photo.title') }}</h2>
            
            <!-- Avatar actual -->
            <div class="flex flex-col items-center">
              <div v-if="usuario.foto_perfil" class="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-blue-100">
                <img :src="usuario.foto_perfil" alt="Foto de perfil" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 border-4 border-blue-100">
                <span class="text-6xl font-bold text-white">{{ iniciales }}</span>
              </div>

              <!-- Vista previa de la nueva foto -->
              <div v-if="previsualizacion" class="w-40 h-40 rounded-full overflow-hidden mb-4 border-4 border-green-400">
                <img :src="previsualizacion" alt="Vista previa" class="w-full h-full object-cover" />
              </div>

              <!-- Input de archivo oculto -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="seleccionarArchivo"
                class="hidden"
              />

              <!-- Botones -->
              <div class="flex flex-col gap-2 w-full">
                <Button
                  icon="pi pi-upload"
                  :label="$t('profile.photo.select')"
                  @click="$refs.fileInput.click()"
                  class="w-full"
                  size="small"
                />
                <Button
                  v-if="archivoSeleccionado"
                  icon="pi pi-check"
                  :label="$t('profile.photo.save')"
                  @click="subirFoto"
                  :loading="subiendoFoto"
                  severity="success"
                  class="w-full"
                  size="small"
                />
                <!-- Barra de progreso durante la subida -->
                <div v-if="subiendoFoto" class="w-full mt-1">
                  <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Subiendo…</span>
                    <span>{{ progressoFoto }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-slate-700">
                    <div
                      class="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
                      :style="{ width: progressoFoto + '%' }"
                    ></div>
                  </div>
                </div>
                <Button
                  v-if="previsualizacion"
                  icon="pi pi-times"
                  :label="$t('profile.photo.cancel')"
                  @click="cancelarSeleccion"
                  severity="secondary"
                  class="w-full"
                  size="small"
                />
              </div>

              <p class="text-xs text-gray-500 mt-3 text-center">
                {{ $t('profile.photo.format') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tarjeta de Información Personal -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">{{ $t('profile.personalInfo.title') }}</h2>

            <form @submit.prevent="actualizarPerfil" class="space-y-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.personalInfo.name') }}</label>
                <InputText
                  v-model="formulario.nombre"
                  class="w-full"
                  :placeholder="$t('profile.personalInfo.namePlaceholder')"
                />
              </div>

              <!-- Apellidos -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.personalInfo.lastName') }}</label>
                <InputText
                  v-model="formulario.Apellidos"
                  class="w-full"
                  :placeholder="$t('profile.personalInfo.lastNamePlaceholder')"
                />
              </div>

              <!-- Email (solo lectura) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.personalInfo.email') }}</label>
                <InputText
                  v-model="formulario.email"
                  class="w-full"
                  disabled
                />
                <p class="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
              </div>

              <!-- Teléfono -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.personalInfo.phone') }}</label>
                <InputText
                  v-model="formulario.telefono"
                  class="w-full"
                  :placeholder="$t('profile.personalInfo.phonePlaceholder')"
                />
              </div>

              <!-- Rol (solo lectura) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('users.role') }}</label>
                <div class="flex items-center gap-2">
                  <span :class="rolClasses" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ rolTexto }}
                  </span>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="flex gap-3 pt-4">
                <Button
                  type="submit"
                  icon="pi pi-save"
                  :label="$t('common.save')"
                  :loading="guardando"
                  class="flex-1"
                />
                <Button
                  type="button"
                  icon="pi pi-refresh"
                  label="Restablecer"
                  @click="restablecerFormulario"
                  severity="secondary"
                />
              </div>
            </form>
          </div>

          <!-- Estadísticas o información adicional -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Información de Cuenta</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <i class="pi pi-calendar text-2xl text-blue-600 dark:text-blue-400"></i>
                <div>
                  <p class="text-xs text-gray-600 dark:text-slate-400">Miembro desde</p>
                  <p class="font-semibold text-gray-900 dark:text-slate-100">{{ fechaCreacion }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <i class="pi pi-shield text-2xl text-green-600 dark:text-green-400"></i>
                <div>
                  <p class="text-xs text-gray-600 dark:text-slate-400">Estado de cuenta</p>
                  <p class="font-semibold text-green-700 dark:text-green-400">Activa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { showSuccess, showError } from '@services/toastService'
import { actualizarUsuario, subirFotoPerfil } from '@services/usuarios'

const { t, locale } = useI18n()

const usuario = ref({})
const formulario = ref({
  nombre: '',
  Apellidos: '',
  email: '',
  telefono: ''
})

const fileInput = ref(null)
const archivoSeleccionado = ref(null)
const previsualizacion = ref(null)
const guardando = ref(false)
const subiendoFoto = ref(false)
const progressoFoto = ref(0)

const iniciales = computed(() => {
  const nombre = usuario.value.nombre?.charAt(0) || ''
  const apellido = usuario.value.Apellidos?.charAt(0) || ''
  return (nombre + apellido).toUpperCase()
})

const rolTexto = computed(() => {
  const rolesMap = {
    1: t('users.roles.admin'),
    2: t('users.roles.instructor'),
    3: t('users.roles.user')
  }
  return rolesMap[usuario.value.rol] || t('users.roles.user')
})

const rolClasses = computed(() => {
  const classes = {
    1: 'bg-purple-100 text-purple-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-gray-100 text-gray-800'
  }
  return classes[usuario.value.rol] || 'bg-gray-100 text-gray-800'
})

const fechaCreacion = computed(() => {
  if (!usuario.value.created_at) return 'N/A'
  const localeCode = locale.value === 'ca' ? 'ca-ES' : locale.value === 'gl' ? 'gl-ES' : locale.value === 'en' ? 'en-US' : 'es-ES'
  return new Date(usuario.value.created_at).toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const cargarUsuario = () => {
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}')
  usuario.value = { ...usuarioLocal }
  formulario.value = {
    nombre: usuarioLocal.nombre || '',
    Apellidos: usuarioLocal.Apellidos || '',
    email: usuarioLocal.email || '',
    telefono: usuarioLocal.telefono || ''
  }
}

const restablecerFormulario = () => {
  formulario.value = {
    nombre: usuario.value.nombre || '',
    Apellidos: usuario.value.Apellidos || '',
    email: usuario.value.email || '',
    telefono: usuario.value.telefono || ''
  }
}

const seleccionarArchivo = (event) => {
  const archivo = event.target.files[0]
  if (!archivo) return

  // Validar tamaño (15MB máximo)
  if (archivo.size > 15 * 1024 * 1024) {
    showError('La imagen no debe superar los 15MB')
    return
  }

  // Validar tipo
  if (!archivo.type.startsWith('image/')) {
    showError('Solo se permiten archivos de imagen')
    return
  }

  archivoSeleccionado.value = archivo

  // Crear vista previa
  const reader = new FileReader()
  reader.onload = (e) => {
    previsualizacion.value = e.target.result
  }
  reader.readAsDataURL(archivo)
}

const cancelarSeleccion = () => {
  archivoSeleccionado.value = null
  previsualizacion.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const subirFoto = async () => {
  if (!archivoSeleccionado.value) return

  subiendoFoto.value = true
  progressoFoto.value = 0
  try {
    const resultado = await subirFotoPerfil(
      usuario.value.id,
      archivoSeleccionado.value,
      (p) => { progressoFoto.value = Math.round(p * 100) }
    )
    
    // Actualizar usuario local
    usuario.value.foto_perfil = resultado.foto_perfil
    const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}')
    usuarioLocal.foto_perfil = resultado.foto_perfil
    localStorage.setItem('usuario', JSON.stringify(usuarioLocal))

    showSuccess('Foto de perfil actualizada correctamente')
    cancelarSeleccion()
  } catch (error) {
    console.error('Error al subir foto:', error)
    showError('Error al subir la foto de perfil')
  } finally {
    subiendoFoto.value = false
    progressoFoto.value = 0
  }
}

const actualizarPerfil = async () => {
  guardando.value = true
  try {
    const datosActualizados = await actualizarUsuario(usuario.value.id, formulario.value)
    
    // Actualizar localStorage
    const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}')
    Object.assign(usuarioLocal, datosActualizados)
    localStorage.setItem('usuario', JSON.stringify(usuarioLocal))
    
    // Actualizar ref local
    usuario.value = { ...usuarioLocal }
    
    showSuccess('Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    showError('Error al actualizar el perfil')
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarUsuario()
})
</script>
