<script setup>
import { ref, onMounted, computed } from 'vue'
import { asuntosAPI } from '@/services/api'
import FormularioEditarAsunto from './FormularioEditarAsunto.vue'
import FormularioEliminarAsunto from './FormularioEliminarAsunto.vue'

// Definir props
const props = defineProps({
  filtros: {
    type: Object,
    default: () => ({ busqueda: '' })
  }
})

// Emitir eventos
const emit = defineEmits(['asunto-actualizado', 'asunto-eliminado'])

// Estados
const asuntos = ref([])
const cargando = ref(true)
const error = ref(null)
const asuntoSeleccionado = ref(null)
const mostrarFormularioEditar = ref(false)

// Cargar asuntos
const cargarAsuntos = async () => {
  cargando.value = true
  error.value = null
  
  try {
    const respuesta = await asuntosAPI.getAll()
    asuntos.value = respuesta.data || []
    console.log('Asuntos cargados:', asuntos.value.length)
  } catch (err) {
    error.value = 'Error al cargar asuntos'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

// Filtro de asuntos
const asuntosFiltrados = computed(() => {
  if (!props.filtros.busqueda) return asuntos.value
  
  return asuntos.value.filter(asunto => {
    const busqueda = props.filtros.busqueda.toLowerCase()
    return (
      asunto.nombre?.toLowerCase().includes(busqueda) ||
      asunto.descripcion?.toLowerCase().includes(busqueda)
    )
  })
})

// Handlers
const handleEditarAsunto = (asunto) => {
  asuntoSeleccionado.value = asunto
  mostrarFormularioEditar.value = true
}

const handleAsuntoActualizado = () => {
  mostrarFormularioEditar.value = false
  cargarAsuntos()
  emit('asunto-actualizado')
}

const handleAsuntoEliminado = () => {
  cargarAsuntos()
  emit('asunto-eliminado')
}

// Ciclo de vida
onMounted(() => {
  cargarAsuntos()
})
</script>

<template>
  <!-- Contenedor principal -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-muni-green-500 to-muni-green-600 text-white p-6">
      <h2 class="text-2xl font-bold flex items-center gap-3">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Asuntos Registrados
      </h2>
    </div>

    <!-- Contenido -->
    <div class="p-6">
      <!-- Estado de carga -->
      <div v-if="cargando" class="flex justify-center py-12">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-muni-green-200 border-t-muni-green-500 rounded-full animate-spin"></div>
          <p class="text-gray-600 font-semibold">Cargando asuntos...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <p class="text-red-800 font-semibold">{{ error }}</p>
      </div>

      <!-- Tabla de asuntos -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-muni-green-200 bg-muni-green-50">
              <th class="px-6 py-4 text-left text-sm font-bold text-muni-green-900">Nombre</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-muni-green-900">Descripción</th>
              <th class="px-6 py-4 text-right text-sm font-bold text-muni-green-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asunto in asuntosFiltrados" :key="asunto.id" class="border-b border-gray-200 hover:bg-muni-green-50 transition group">
              <!-- Nombre -->
              <td class="px-6 py-4">
                <div class="font-semibold text-gray-900">{{ asunto.nombre }}</div>
              </td>

              <!-- Descripción -->
              <td class="px-6 py-4">
                <div class="text-gray-600 text-sm line-clamp-2">{{ asunto.descripcion || '-' }}</div>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FormularioEditarAsunto 
                    :asunto="asunto"
                    @asunto-actualizado="handleAsuntoActualizado"
                  />
                  <FormularioEliminarAsunto 
                    :asunto="asunto"
                    @asunto-eliminado="handleAsuntoEliminado"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Sin resultados -->
        <div v-if="asuntosFiltrados.length === 0" class="py-12 text-center">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-600 font-semibold">No hay asuntos registrados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
