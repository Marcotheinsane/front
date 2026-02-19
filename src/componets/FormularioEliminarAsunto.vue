<script setup>
import { ref } from 'vue'
import { asuntosAPI } from '@/services/api'

// Props
const props = defineProps({
  asunto: {
    type: Object,
    required: true
  }
})

// Estados
const mostrarModal = ref(false)
const cargando = ref(false)
const error = ref(null)
const confirmacion = ref(false)

// Abrir modal
const abrirModal = () => {
  mostrarModal.value = true
  error.value = null
  confirmacion.value = false
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModal.value = false
  confirmacion.value = false
}

// Eliminar asunto
const eliminarAsunto = async () => {
  cargando.value = true
  error.value = null

  try {
    console.log('Eliminando asunto:', props.asunto.id)
    await asuntosAPI.delete(props.asunto.id)
    
    confirmacion.value = true
    console.log('Asunto eliminado')
    
    // Cerrar modal después de 1 segundo
    setTimeout(() => {
      cerrarModal()
      // Emitir evento para recargar listado
      emit('asunto-eliminado')
    }, 1000)

  } catch (err) {
    error.value = err.response?.data?.mensaje || err.message || 'Error al eliminar asunto'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

// Emitir evento
const emit = defineEmits(['asunto-eliminado'])
</script>

<template>
  <!-- Botón para abrir modal -->
  <button 
    @click="abrirModal"
    class="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition font-semibold text-sm"
  >
    Eliminar
  </button>

  <!-- Modal overlay -->
  <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
    <!-- Modal contenido -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 5a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">Eliminar Asunto</h2>
            <p class="text-red-100 text-sm">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <button 
          @click="cerrarModal"
          :disabled="cargando"
          class="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 flex items-center justify-center rounded-lg transition disabled:opacity-50"
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

        <!-- Mensaje de confirmación -->
        <div v-if="confirmacion" class="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg">
          <p class="text-emerald-800 font-semibold text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            ¡Asunto eliminado!
          </p>
        </div>

        <!-- Información del asunto a eliminar -->
        <div v-if="!confirmacion" class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Asunto a eliminar:</h3>
          <div class="space-y-2">
            <div>
              <p class="text-xs text-gray-600">Nombre:</p>
              <p class="font-semibold text-gray-900">{{ asunto.nombre }}</p>
            </div>
            <div v-if="asunto.descripcion">
              <p class="text-xs text-gray-600">Descripción:</p>
              <p class="text-gray-700">{{ asunto.descripcion }}</p>
            </div>
          </div>
        </div>

        <!-- Advertencia -->
        <div v-if="!confirmacion" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p class="text-red-800 font-semibold text-sm flex items-start gap-2">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>Se eliminarán todas las instancias asociadas a este asunto. Esta acción es irreversible.</span>
          </p>
        </div>

        <!-- Botones -->
        <div class="flex gap-3">
          <button 
            type="button"
            @click="cerrarModal"
            :disabled="cargando"
            class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="button"
            @click="eliminarAsunto"
            :disabled="cargando || confirmacion"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="cargando" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else-if="confirmacion" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            {{ cargando ? 'Eliminando...' : confirmacion ? 'Eliminado' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
