<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/auth'

const router = useRouter()

// Estados
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const mostrarPassword = ref(false)

// Función de login
const handleLogin = async () => {
  // Validación
  if (!username.value || !password.value) {
    error.value = 'Por favor completa todos los campos'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await authAPI.login(username.value, password.value)
    
    // Guardar token y usuario
    authAPI.setToken(response.data.token)
    authAPI.setUser({
      id: response.data.user.id,
      username: response.data.user.username,
      nombre: response.data.user.nombre || response.data.user.username,
      rol: response.data.user.rol || 'usuario'
    })

    // Redirigir al dashboard
    await router.push({ name: 'Dashboard' })
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión: ' + err.message
    console.error('Error de login:', err)
  } finally {
    loading.value = false
  }
}

// Tecla Enter para enviar
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

// Credenciales demo - SOLO PARA DESARROLLO LOCAL (comentado en producción)
// const usarDemoUser = () => {
//   username.value = 'demo'
//   password.value = 'demo123'
// }

// const usarAdminUser = () => {
//   username.value = 'admin'
//   password.value = 'admin123'
// }
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-muni-green-50 via-white to-muni-green-100 flex items-center justify-center p-4">
    <!-- Fondo decorativo -->
    <div class="absolute top-0 right-0 w-96 h-96 bg-muni-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-muni-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

    <!-- Contenedor del login -->
    <div class="relative w-full max-w-md">
      <!-- Card principal -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
        <!-- Header -->
        <div class="text-center space-y-3">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-500 to-muni-green-700 rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 class="text-3xl font-bold text-muni-green-900">Muni Gestión</h1>
          <p class="text-muni-green-600 text-sm">Gestión de Asuntos, Instancias y Asistencia</p>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p class="text-red-800 text-sm font-semibold">{{ error }}</p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Campo Usuario -->
          <div class="space-y-2">
            <label for="username" class="block text-sm font-semibold text-muni-green-900">
              Usuario
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Ingresa tu usuario"
              @keypress="handleKeyPress"
              :disabled="loading"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:border-muni-green-500 focus:ring-2 focus:ring-muni-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            />
          </div>

          <!-- Campo Contraseña -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-muni-green-900">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="mostrarPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Ingresa tu contraseña"
                @keypress="handleKeyPress"
                :disabled="loading"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:border-muni-green-500 focus:ring-2 focus:ring-muni-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
              />
              <button
                type="button"
                @click="mostrarPassword = !mostrarPassword"
                :disabled="loading"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muni-green-600 hover:text-muni-green-700 disabled:opacity-50"
              >
                <svg v-if="!mostrarPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753M9 3l3 3m0 0l3-3m-3 3l-3-3m3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Botón Login -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
