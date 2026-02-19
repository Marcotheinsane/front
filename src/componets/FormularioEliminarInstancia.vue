<script setup>
import { ref } from 'vue'
import { instanciasAPI } from '@/services/api'

// Props
const props = defineProps({
  instancia: {
    type: Object,
    required: true
  }
})

// Estados
const mostrarConfirmacion = ref(false)
const cargando = ref(false)
const error = ref(null)

// Emitir evento
const emit = defineEmits(['instancia-eliminada'])

// Abrir modal de confirmación
const abrirConfirmacion = () => {
  mostrarConfirmacion.value = true
  error.value = null
}

// Cerrar modal
const cerrarConfirmacion = () => {
  mostrarConfirmacion.value = false
}

// Eliminar instancia
const eliminarInstancia = async () => {
  cargando.value = true
  error.value = null

  try {
    console.log('Eliminando instancia:', props.instancia.id)
    await instanciasAPI.delete(props.instancia.id)
    
    console.log('Instancia eliminada exitosamente')
    
    // Emitir evento para recargar listado
    emit('instancia-eliminada')
    cerrarConfirmacion()

  } catch (err) {
    error.value = err.response?.data?.mensaje || err.message || 'Error al eliminar instancia'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <!-- Botón para abrir confirmación -->
  <button 
    @click="abrirConfirmacion"
    class="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 text-sm"
    title="Eliminar instancia"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
    Eliminar
  </button>

  <!-- Modal de confirmación -->
  <div v-if="mostrarConfirmacion" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
    <!-- Modal contenido -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 5v1m7.08-14.071l-1.414 1.414M15.536 7.464L14.12 6.05M9.172 15.536L7.757 14.12M6.05 9.172L7.464 7.757" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">¿Eliminar instancia?</h2>
            <p class="text-red-100 text-sm">Esta acción no se puede deshacer</p>
          </div>
        </div>
      </div>

      <!-- Cuerpo del modal -->
      <div class="p-6">
        <!-- Información de la instancia -->
        <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-300 rounded-lg">
          <p class="text-sm text-gray-600 mb-1">Se eliminará permanentemente:</p>
          <p class="font-bold text-red-900 text-lg">{{ props.instancia.fecha }}</p>
          <p class="text-sm text-gray-600 mt-1">ID: {{ props.instancia.id }}</p>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p class="text-red-800 font-semibold text-sm">{{ error }}</p>
        </div>

        <!-- Advertencia -->
        <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-300 rounded-lg">
          <p class="text-yellow-800 text-sm">
            <strong>Advertencia:</strong> Todos los registros de asistencia de esta instancia también serán eliminados.
          </p>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button 
            @click="cerrarConfirmacion"
            :disabled="cargando"
            class="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            @click="eliminarInstancia"
            :disabled="cargando"
            class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="cargando" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ cargando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
