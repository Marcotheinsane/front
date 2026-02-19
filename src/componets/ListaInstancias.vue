<script setup>
import { ref, onMounted, computed } from 'vue'
import { instanciasAPI, asuntosAPI } from '@/services/api'
import FormularioEditarInstancia from '@/componets/FormularioEditarInstancia.vue'
import FormularioEliminarInstancia from '@/componets/FormularioEliminarInstancia.vue'
import ListaAsistentesInstancia from '@/componets/ListaAsistentesInstancia.vue'

// Props para recibir filtros del padre
const props = defineProps({
  filtros: {
    type: Object,
    default: () => ({ busqueda: '', ano: new Date().getFullYear() })
  }
})

// Estados
const instancias = ref([])
const asuntos = ref([])
const loading = ref(false)
const error = ref(null)
const mostrarAsistentes = ref(false)
const instanciaSeleccionada = ref(null)

// Función para obtener instancias
const obtenerInstancias = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Obtener asuntos
    const responseAsuntos = await asuntosAPI.getAll()
    asuntos.value = responseAsuntos.data
    console.log('Asuntos cargados:', asuntos.value)

    // Obtener todas las instancias por cada asunto
    let todasInstancias = []
    for (const asunto of asuntos.value) {
      try {
        const responseInstancias = await instanciasAPI.getByAsunto(asunto.id)
        const instanciasList = responseInstancias.data || []
        todasInstancias = todasInstancias.concat(instanciasList)
      } catch (err) {
        console.warn(`No se pudieron cargar instancias del asunto ${asunto.id}:`, err)
      }
    }
    
    instancias.value = todasInstancias
    console.log('Instancias obtenidas:', instancias.value)
  } catch (err) {
    error.value = err.message || 'Error al obtener instancias'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Obtener nombre del asunto
const getNombreAsunto = (asuntoId) => {
  const asunto = asuntos.value.find(a => a.id === asuntoId)
  return asunto?.nombre || 'Sin asunto'
}

// Instancias filtradas
const instanciasFiltradas = computed(() => {
  return instancias.value.filter(instancia => {
    // Filtrar por búsqueda (fecha, descripción, asunto)
    const coincideBusqueda = !props.filtros.busqueda || 
      instancia.fecha?.includes(props.filtros.busqueda) ||
      instancia.descripcion?.toLowerCase().includes(props.filtros.busqueda.toLowerCase()) ||
      getNombreAsunto(instancia.asunto_id).toLowerCase().includes(props.filtros.busqueda.toLowerCase())
    
    // Filtrar por año (extraer el año de la fecha)
    const fechaParts = instancia.fecha?.split('-') || []
    const anoInstancia = parseInt(fechaParts[0], 10)
    const coincideAno = anoInstancia === props.filtros.ano
    
    return coincideBusqueda && coincideAno
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Obtener instancias cuando el componente se carga
onMounted(() => {
  obtenerInstancias()
})

// Recargar datos
const recargar = () => {
  obtenerInstancias()
}

// Recargar cuando se edita una instancia
const handleInstanciaActualizada = () => {
  obtenerInstancias()
}

// Recargar cuando se elimina una instancia
const handleInstanciaEliminada = () => {
  obtenerInstancias()
}

// Abrir modal de asistentes
const abrirAsistentes = (instancia) => {
  instanciaSeleccionada.value = instancia
  mostrarAsistentes.value = true
}

// Cerrar modal de asistentes
const cerrarAsistentes = () => {
  mostrarAsistentes.value = false
  instanciaSeleccionada.value = null
}

// Formatear fecha
const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<template>
  <div class="instancias-container">
    <!-- Header con título y botón -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-2 border-muni-green-100">
      <div>
        <h2 class="text-3xl font-bold text-muni-green-900">Instancias/Reuniones</h2>
        <p class="text-muni-green-600 text-sm mt-2">Gestiona las fechas y eventos de cada asunto</p>
      </div>
      <button 
        @click="recargar"
        :disabled="loading"
        class="flex items-center gap-2 bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative w-16 h-16 mb-4">
        <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
        <div class="absolute inset-0 bg-muni-green-500 rounded-full animate-ping opacity-75"></div>
      </div>
      <p class="text-muni-green-600 font-semibold text-lg">Cargando instancias...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4 shadow-sm">
      <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="text-red-800 font-semibold text-sm">Error al cargar instancias</p>
        <p class="text-red-700 text-sm mt-2">{{ error }}</p>
      </div>
    </div>

    <!-- Tabla de instancias mejorada -->
    <div v-if="!loading && !error && instanciasFiltradas.length > 0" class="overflow-x-auto rounded-xl">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-muni-green-200 bg-gradient-to-r from-muni-green-50 to-muni-green-100">
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">ID</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Fecha</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Asunto</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Descripción</th>
            <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-blue-100">
          <tr 
            v-for="(instancia, index) in instanciasFiltradas" 
            :key="instancia.id"
            :class="[
              'transition duration-300 group',
              index % 2 === 0 ? 'bg-white hover:bg-muni-green-50' : 'bg-muni-green-25 hover:bg-muni-green-75'
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-muni-green-300 to-muni-green-500 text-white text-sm font-bold shadow-md">{{ instancia.id }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-mono text-sm text-muni-green-900 bg-muni-green-100 px-4 py-2 rounded-lg font-semibold">{{ instancia.fecha }}</span>
            </td>
            <td class="px-6 py-4 text-muni-green-900 font-semibold">
              <span class="inline-block bg-muni-green-100 text-muni-green-800 px-3 py-1 rounded-full text-sm">{{ getNombreAsunto(instancia.asunto_id) }}</span>
            </td>
            <td class="px-6 py-4 text-muni-green-700 text-sm">{{ instancia.descripcion || '-' }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                <!-- Ver Asistentes -->
                <button 
                  @click="abrirAsistentes(instancia)"
                  class="text-muni-green-600 hover:text-muni-green-800 hover:bg-muni-green-50 px-3 py-2 rounded-lg transition font-semibold text-sm"
                  title="Ver asistentes"
                >
                  Ver Asistentes
                </button>
                
                <!-- Componente Editar -->
                <FormularioEditarInstancia 
                  :instancia="instancia"
                  @instancia-actualizada="handleInstanciaActualizada"
                />
                
                <!-- Componente Eliminar -->
                <FormularioEliminarInstancia 
                  :instancia="instancia"
                  @instancia-eliminada="handleInstanciaEliminada"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vacío -->
    <div v-if="!loading && !error && instanciasFiltradas.length === 0 && instancias.length > 0" class="text-center py-20">
      <svg class="w-16 h-16 text-muni-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-muni-green-800 font-bold text-lg">No se encontraron resultados</p>
      <p class="text-muni-green-600 text-sm mt-2">Intenta con otros filtros o búsqueda</p>
    </div>

    <!-- Sin instancias registradas -->
    <div v-if="!loading && !error && instancias.length === 0" class="text-center py-20">
      <div class="w-20 h-20 mx-auto bg-muni-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-muni-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
        </svg>
      </div>
      <p class="text-muni-green-800 font-bold text-lg">No hay instancias registradas</p>
      <p class="text-muni-green-600 text-sm mt-2">Las instancias aparecerán aquí cuando se creen en el sistema</p>
    </div>
  </div>

  <!-- Modal de Asistentes -->
  <div v-if="mostrarAsistentes && instanciaSeleccionada" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header del modal -->
      <div class="sticky top-0 bg-gradient-to-r from-muni-green-600 to-muni-green-700 text-white p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">Registro de Asistentes</h2>
            <p class="text-muni-green-100 text-sm">
              {{ instanciaSeleccionada.fecha }} - {{ getNombreAsunto(instanciaSeleccionada.asunto_id) }}
            </p>
          </div>
        </div>
        <button 
          @click="cerrarAsistentes"
          class="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 flex items-center justify-center rounded-lg transition"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido del modal -->
      <div class="p-6">
        <ListaAsistentesInstancia :instancia-id="instanciaSeleccionada.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.instancias-container {
  padding: 2rem 1.5rem;
}

/* Prevenir scroll horizontal en móviles */
@media (max-width: 640px) {
  .instancias-container {
    padding: 1.5rem 1rem;
  }
  
  table {
    font-size: 0.875rem;
  }
}
</style>
