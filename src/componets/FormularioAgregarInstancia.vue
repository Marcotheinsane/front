<script setup>
import { ref } from 'vue'
import { asuntosAPI, instanciasAPI, personasAPI, asistenciaAPI } from '@/services/api'

// Estados
const mostrarModal = ref(false)
const cargando = ref(false)
const error = ref(null)
const exito = ref(false)
const asuntos = ref([])

// Datos del formulario
const formulario = ref({
  asunto_id: '',
  fecha: '',
  descripcion: ''
})

// Año actual por default
const anoActual = new Date().getFullYear()
const mesActual = String(new Date().getMonth() + 1).padStart(2, '0')
const diaActual = String(new Date().getDate()).padStart(2, '0')
const fechaDefault = `${anoActual}-${mesActual}-${diaActual}`

// Cargar asuntos
const cargarAsuntos = async () => {
  try {
    const response = await asuntosAPI.getAll()
    asuntos.value = response.data
    console.log('Asuntos cargados:', asuntos.value)
  } catch (err) {
    console.error('Error al cargar asuntos:', err)
  }
}

// Abrir modal
const abrirModal = () => {
  mostrarModal.value = true
  error.value = null
  exito.value = false
  limpiarFormulario()
  cargarAsuntos()
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModal.value = false
  limpiarFormulario()
}

// Limpiar formulario
const limpiarFormulario = () => {
  formulario.value = {
    asunto_id: '',
    fecha: fechaDefault,
    descripcion: ''
  }
}

// Registrar asistentes por defecto
const registrarAsistentesPorDefecto = async (instanciaId) => {
  try {
    // Obtener lista de personas
    const respuestaPersonas = await personasAPI.getAll()
    const personas = respuestaPersonas.data || []
    
    console.log('Personas a registrar como inasistentes:', personas.length)
    
    // Registrar cada persona como inasistente (asistio = false)
    for (const persona of personas) {
      try {
        await asistenciaAPI.registrarPersona(instanciaId, {
          persona_id: persona.id,
          asistio: false
        })
        console.log(`Persona ${persona.id} registrada como inasistente`)
      } catch (err) {
        console.error(`Error registrando persona ${persona.id}:`, err)
      }
    }
    
    console.log('Todos los asistentes registrados')
  } catch (err) {
    console.error('Error al registrar asistentes por defecto:', err)
    throw err
  }
}

// Guardar instancia
const guardarInstancia = async () => {
  // Validación básica
  if (!formulario.value.asunto_id || !formulario.value.fecha) {
    error.value = 'Por favor completa los campos requeridos (Asunto, Fecha)'
    return
  }

  cargando.value = true
  error.value = null
  exito.value = false

  try {
    const datos = {
      asunto_id: parseInt(formulario.value.asunto_id, 10),
      fecha: formulario.value.fecha,
      descripcion: formulario.value.descripcion || ''
    }

    console.log('Enviando datos de instancia:', datos)
    const respuesta = await instanciasAPI.create(datos)
    const instanciaId = respuesta.data.id
    
    // Registrar los asistentes por defecto como inasistentes
    await registrarAsistentesPorDefecto(instanciaId)
    
    exito.value = true
    console.log('Instancia creada con asistentes registrados:', respuesta.data)
    
    // Cerrar modal después de 1.5 segundos
    setTimeout(() => {
      cerrarModal()
      // Emitir evento para recargar listado
      emit('instancia-agregada')
    }, 1500)

  } catch (err) {
    error.value = err.response?.data?.mensaje || err.message || 'Error al crear instancia'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

// Emitir evento
const emit = defineEmits(['instancia-agregada'])
</script>

<template>
  <!-- Botón para abrir modal -->
  <button 
    @click="abrirModal"
    class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    Agregar Instancia
  </button>

  <!-- Modal overlay -->
  <div v-if="mostrarModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
    <!-- Modal contenido -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full z-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">Nueva Instancia</h2>
            <p class="text-blue-100 text-sm">Crear reunión/evento</p>
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
            ¡Instancia creada exitosamente!
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarInstancia" class="space-y-4">
          <!-- Asunto -->
          <div>
            <label class="block text-sm font-semibold text-blue-800 mb-2">Asunto/Reunión *</label>
            <select 
              v-model="formulario.asunto_id"
              :disabled="cargando || exito"
              class="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 bg-white"
            >
              <option value="">Selecciona un asunto...</option>
              <option 
                v-for="asunto in asuntos" 
                :key="asunto.id" 
                :value="asunto.id"
              >
                {{ asunto.nombre }}
              </option>
            </select>
          </div>

          <!-- Fecha -->
          <div>
            <label class="block text-sm font-semibold text-blue-800 mb-2">Fecha *</label>
            <input 
              v-model="formulario.fecha"
              type="date" 
              :disabled="cargando || exito"
              class="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
            >
            <p class="text-xs text-blue-600 mt-1">Formato: YYYY-MM-DD</p>
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-semibold text-blue-800 mb-2">Descripción (opcional)</label>
            <textarea 
              v-model="formulario.descripcion"
              placeholder="Detalles de la reunión/evento..."
              :disabled="cargando || exito"
              rows="3"
              class="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
            ></textarea>
          </div>

          <!-- Año (solo visualización) -->
          <div class="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p class="text-xs text-blue-600 font-semibold uppercase">Año de la instancia</p>
            <p class="text-lg font-bold text-blue-900">{{ anoActual }}</p>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 pt-4">
            <button 
              type="button"
              @click="cerrarModal"
              :disabled="cargando || exito"
              class="flex-1 px-4 py-2 border-2 border-blue-300 text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="cargando || exito"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="cargando" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else-if="exito" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ cargando ? 'Guardando...' : exito ? 'Guardado' : 'Guardar Instancia' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
