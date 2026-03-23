<template>
    <div class="flex-1 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div class="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-8">
            <div class="flex flex-col items-center mb-6">
                <!-- Logo / proyecto placeholder -->
                <div class="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM2 18a8 8 0 0116 0H2z" /></svg>
                </div>
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-slate-100">{{ $t('auth.loginTitle') }}</h1>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-1">{{ $t('auth.loginSubtitle') }}</p>
            </div>

            <form @submit.prevent="handleSubmit" novalidate>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1" for="username">{{ $t('auth.user') }}</label>
                        <input
                            id="username"
                            v-model="username"
                            type="text"
                            autocomplete="username"
                            :class="inputClass(usernameError)"
                            :placeholder="$t('auth.userPlaceholder')"
                        />
                        <p v-if="usernameError" class="text-xs text-red-600 mt-1">{{ usernameError }}</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1" for="password">{{ $t('auth.password') }}</label>
                        <div class="relative">
                            <input
                                id="password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="current-password"
                                :class="inputClass(passwordError)"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-2 pr-2 flex items-center text-sm text-gray-500"
                                :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
>
                                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
/>
                                    <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
/>
                                </svg>
                                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.293-3.559M6.1 6.1A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.99 9.99 0 01-1.286 2.69M3 3l18 18"
/>
                                </svg>
                            </button>
                        </div>
                        <p v-if="passwordError" class="text-xs text-red-600 mt-1">{{ passwordError }}</p>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                        <label class="inline-flex items-center">
                            <input type="checkbox" v-model="remember" class="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span class="ml-2 text-gray-700">{{ $t('auth.rememberMe') }}</span>
                        </label>
                        <a href="#" class="text-indigo-600 hover:underline">{{ $t('auth.forgotPassword') }}</a>
                    </div>

                    <div>
                        <button
                            type="submit"
                            :disabled="loading"
                            class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-md transition"
>
                            <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            <span v-if="!loading">{{ $t('auth.loginButton') }}</span>
                            <span v-else>{{ $t('auth.loggingIn') }}</span>
                        </button>
                    </div>

                  <!--  <p class="text-sm text-center text-gray-500">
                        ¿No tienes cuenta?
                        <a href="#" class="text-indigo-600 hover:underline">Regístrate</a>
                    </p> -->

                    <p v-if="errorMessage" class="text-sm text-red-600 text-center">{{ errorMessage }}</p>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { login } from '@services/auth.js'
import { useAuth } from '@composables/useAuth'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { setAuth } = useAuth()

const username = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// track whether the user has started interacting with the fields
const usernameTouched = ref(false)
const passwordTouched = ref(false)

const usernameError = computed(() => {
    if (!username.value) return t('errors.required')
    return ''
})
const passwordError = computed(() => {
    if (!password.value) return t('errors.required')
    if (password.value.length > 0 && password.value.length < 4) return t('errors.minLength', { count: 6 })
    return ''
})

// errores sólo visibles si el campo fue tocado (user started typing)
const visibleUsernameError = computed(() => usernameTouched.value && usernameError.value)
const visiblePasswordError = computed(() => passwordTouched.value && passwordError.value)

onMounted(() => {
    // Si quieres precargar el usuario guardado
    const saved = localStorage.getItem('savedUser')
    if (saved) username.value = saved
})

function inputClass(hasError) {
    return [
        'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm',
        hasError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'
    ].join(' ')
}

async function fakeAuthApi(u, p) {
    // Reemplaza por llamada real a tu API
    await new Promise(r => setTimeout(r, 800))
    // Ejemplo: usuario correcto "admin" y contraseña "password"
    if ((u === 'admin' || u === 'admin@ejemplo.com') && p === 'password') {
        return { ok: true, token: 'fake-token-123' }
    }
    return { ok: false, message: 'Usuario o contraseña incorrectos.' }
}

async function handleSubmit() {
    errorMessage.value = ''
    // marcar campos como tocados para que las validaciones se muestren si hay errores
    usernameTouched.value = true
    passwordTouched.value = true

    // Validaciones sencillas
    if (usernameError.value || passwordError.value) {
        errorMessage.value = 'Por favor corrige los datos del formulario.'
        return
    }

    loading.value = true
    try {
        const data = {
            email: username.value.trim(),
            password: password.value
        }
        const res = await login(data)
        if (!res.ok) {
            errorMessage.value = res.message || 'Error de autenticación'
            return
        }

        // Actualizar estado global de autenticación
        setAuth(res.accessToken, res.usuario)
        
        if (remember.value) localStorage.setItem('savedUser', username.value.trim())
        else localStorage.removeItem('savedUser')

        // Redirigir a la ruta solicitada o a Home
        const redirectPath = route.query.redirect
        if (redirectPath && redirectPath !== '/Login') {
          router.push(redirectPath).catch(() => {})
        } else {
          router.push({ name: 'Home' }).catch(() => {})
        }
    } catch (err) {
        const { response } = err
        errorMessage.value = response?.data?.message || 'Error de red. Intenta de nuevo.'
    } finally {
        loading.value = false
    }
}
</script>