<script setup>
import { ref } from 'vue'
import { personasAPI } from '@/services/api'

// Estados
const mostrarModal = ref(false)
const cargando = ref(false)
const error = ref(null)
const exito = ref(false)

// Datos del formulario
const formulario = ref({
  rut: '',
  nombre: '',
  apellido: '',
  descripcion: ''
})

// Año actual por default
const anoActual = new Date().getFullYear()

// Abrir modal
const abrirModal = () => {
  mostrarModal.value = true
  error.value = null
  exito.value = false
  limpiarFormulario()
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModal.value = false
  limpiarFormulario()
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.value = {
    rut: '',
    nombre: '',
    apellido: '',
    descripcion: ''
  }
}

// Guardar cliente
const guardarCliente = async () => {
  // Validación básica
  if (!formulario.value.rut || !formulario.value.nombre || !formulario.value.apellido) {
    error.value = 'Por favor completa los campos requeridos (RUT, Nombre, Apellido)'
    return
  }

  cargando.value = true
  error.value = null
  exito.value = false

  try {
    const datos = {
      rut: formulario.value.rut,
      nombres: formulario.value.nombre,
      apellidos: formulario.value.apellido,
      descripcion: formulario.value.descripcion || ''
    }

    console.log('Enviando datos:', datos)
    const respuesta = await personasAPI.create(datos)
    
    exito.value = true
    console.log('Cliente creado:', respuesta.data)
    
    // Cerrar modal después de 1.5 segundos
    setTimeout(() => {
      cerrarModal()
      // Emitir evento para recargar listado
      emit('cliente-agregado')
    }, 1500)

  } catch (err) {
    error.value = err.response?.data?.mensaje || err.message || 'Error al crear cliente'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

// Emitir evento
const emit = defineEmits(['cliente-agregado'])
</script>

<template>
  <!-- Botón para abrir modal -->
  <button 
    @click="abrirModal"
    class="flex items-center gap-2 bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Agregar Cliente
  </button>

  <!-- Modal overlay -->
  <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
    <!-- Modal contenido -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-muni-green-600 to-muni-green-700 text-white p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">Nuevo Cliente</h2>
            <p class="text-muni-green-100 text-sm">Año {{ anoActual }}</p>
          </div>
        </div>
        <button 
          @click="cerrarModal"
          class="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 flex items-center justify-center rounded-lg transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Cuerpo del modal -->
      <div class="p-6">
        <!-- Mensaje de error -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p class="text-red-800 font-semibold text-sm">{{ error }}</p>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="exito" class="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
          <p class="text-emerald-800 font-semibold text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            ¡Cliente creado exitosamente!
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarCliente" class="space-y-4">
          <!-- RUT -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">RUT *</label>
            <input 
              v-model="formulario.rut"
              type="text" 
              placeholder="12.345.678-9"
              :disabled="cargando || exito"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition disabled:bg-gray-100"
            >
            <p class="text-xs text-muni-green-600 mt-1">Formato: 12.345.678-9</p>
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Nombre *</label>
            <input 
              v-model="formulario.nombre"
              type="text" 
              placeholder="Ej: Juan"
              :disabled="cargando || exito"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition disabled:bg-gray-100"
            >
          </div>

          <!-- Apellido -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Apellido *</label>
            <input 
              v-model="formulario.apellido"
              type="text" 
              placeholder="Ej: González"
              :disabled="cargando || exito"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition disabled:bg-gray-100"
            >
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Descripción (opcional)</label>
            <textarea 
              v-model="formulario.descripcion"
              placeholder="Notas o información adicional..."
              :disabled="cargando || exito"
              rows="3"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition disabled:bg-gray-100"
            ></textarea>
          </div>

          <!-- Año (solo visualización) -->
          <div class="p-3 bg-muni-green-50 border-2 border-muni-green-200 rounded-lg">
            <p class="text-xs text-muni-green-600 font-semibold uppercase">Año de registro</p>
            <p class="text-lg font-bold text-muni-green-900">{{ anoActual }}</p>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="cerrarModal"
              :disabled="cargando || exito"
              class="flex-1 px-4 py-2 border-2 border-muni-green-300 text-muni-green-700 font-semibold rounded-lg hover:bg-muni-green-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="cargando || exito"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="cargando" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else-if="exito" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ cargando ? 'Guardando...' : exito ? 'Guardado' : 'Guardar Cliente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
