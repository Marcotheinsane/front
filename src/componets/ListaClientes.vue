<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { personasAPI } from '@/services/api'
import FormularioEditarCliente from '@/componets/FormularioEditarCliente.vue'
import FormularioEliminarCliente from '@/componets/FormularioEliminarCliente.vue'

const router = useRouter()

// Props para recibir filtros del padre
const props = defineProps({
  filtros: {
    type: Object,
    default: () => ({ busqueda: '', ano: new Date().getFullYear() })
  }
})

// Estados
const clientes = ref([])
const loading = ref(false)
const error = ref(null)

// Función para obtener clientes
const obtenerClientes = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await personasAPI.getAll()
    clientes.value = response.data
    console.log('Clientes obtenidos:', clientes.value)
  } catch (err) {
    error.value = err.message || 'Error al obtener clientes'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Clientes filtrados por búsqueda y año
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    // Filtrar por búsqueda (nombre, apellido, RUT)
    const coincideBusqueda = !props.filtros.busqueda || 
      (cliente.nombre && cliente.nombre.toLowerCase().includes(props.filtros.busqueda.toLowerCase())) ||
      (cliente.apellido && cliente.apellido.toLowerCase().includes(props.filtros.busqueda.toLowerCase())) ||
      (cliente.nombres && cliente.nombres.toLowerCase().includes(props.filtros.busqueda.toLowerCase())) ||
      (cliente.apellidos && cliente.apellidos.toLowerCase().includes(props.filtros.busqueda.toLowerCase())) ||
      (cliente.rut && cliente.rut.includes(props.filtros.busqueda))
    
    // Filtrar por año (si el cliente tiene datos de ese año)
    // Por ahora, mostrar todos los clientes (el filtro de año es más para asuntos/instancias)
    const coincideAno = true
    
    return coincideBusqueda && coincideAno
  })
})

// Obtener clientes cuando el componente se carga
onMounted(() => {
  obtenerClientes()
})

// Recargar datos
const recargar = () => {
  obtenerClientes()
}

// Recargar cuando se edita un cliente
const handleClienteActualizado = () => {
  obtenerClientes()
}

// Recargar cuando se elimina un cliente
const handleClienteEliminado = () => {
  obtenerClientes()
}

// Navegar a detalle de asistencia
const verDetalleAsistencia = (cliente) => {
  router.push({
    name: 'DetalleClienteAsistencia',
    params: {
      clienteId: cliente.id,
      clienteNombre: `${cliente.nombres || cliente.nombre} ${cliente.apellidos || cliente.apellido}`
    }
  })
}
</script>

<template>
  <div class="clientes-container">
    <!-- Header con título y botón -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b-2 border-muni-green-100">
      <div>
        <h2 class="text-3xl font-bold text-muni-green-900">Clientes</h2>
        <p class="text-muni-green-600 text-sm mt-2">Gestiona y visualiza todos los clientes registrados en el sistema</p>
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
      <p class="text-muni-green-600 font-semibold text-lg">Cargando clientes...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4 shadow-sm">
      <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="text-red-800 font-semibold text-sm">Error al cargar clientes</p>
        <p class="text-red-700 text-sm mt-2">{{ error }}</p>
      </div>
    </div>

    <!-- Tabla de clientes mejorada -->
    <div v-if="!loading && !error && clientesFiltrados.length > 0" class="overflow-x-auto rounded-xl">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-muni-green-200 bg-gradient-to-r from-muni-green-50 to-muni-green-100">
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">ID</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">RUT</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Apellidos</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Nombres</th>
            <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-muni-green-100">
          <tr 
            v-for="(cliente, index) in clientesFiltrados" 
            :key="cliente.id"
            :class="[
              'transition duration-300 group',
              index % 2 === 0 ? 'bg-white hover:bg-muni-green-50' : 'bg-muni-green-25 hover:bg-muni-green-75'
            ]"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-muni-green-300 to-muni-green-500 text-white text-sm font-bold shadow-md">{{ cliente.id }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-mono text-sm text-muni-green-900 bg-muni-green-100 px-4 py-2 rounded-lg font-semibold">{{ cliente.rut }}</span>
            </td>
            <td class="px-6 py-4 text-muni-green-900 font-semibold">{{ cliente.apellidos }}</td>
            <td class="px-6 py-4 text-muni-green-700">{{ cliente.nombres }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                <!-- Botón Ver Detalles -->
                <button 
                  @click="verDetalleAsistencia(cliente)"
                  class="inline-flex items-center justify-center w-10 h-10 rounded-lg text-muni-green-600 hover:text-white hover:bg-muni-green-500 transition duration-300 transform hover:scale-110 shadow-sm"
                  title="Ver detalles de asistencia"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <!-- Componente Editar -->
                <FormularioEditarCliente 
                  :cliente="cliente"
                  @cliente-actualizado="handleClienteActualizado"
                />
                
                <!-- Componente Eliminar -->
                <FormularioEliminarCliente 
                  :cliente="cliente"
                  @cliente-eliminado="handleClienteEliminado"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vacío -->
    <div v-if="!loading && !error && clientesFiltrados.length === 0 && clientes.length > 0" class="text-center py-20">
      <svg class="w-16 h-16 text-muni-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-muni-green-800 font-bold text-lg">No se encontraron resultados</p>
      <p class="text-muni-green-600 text-sm mt-2">Intenta con otros filtros o búsqueda</p>
    </div>

    <!-- Sin clientes registrados -->
    <div v-if="!loading && !error && clientes.length === 0" class="text-center py-20">
      <div class="w-20 h-20 mx-auto bg-muni-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-muni-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
        </svg>
      </div>
      <p class="text-muni-green-800 font-bold text-lg">No hay clientes registrados</p>
      <p class="text-muni-green-600 text-sm mt-2">Los clientes aparecerán aquí cuando se registren en el sistema</p>
    </div>
  </div>
</template>

<style scoped>
.clientes-container {
  padding: 2rem 1.5rem;
}

/* Prevenir scroll horizontal en móviles */
@media (max-width: 640px) {
  .clientes-container {
    padding: 1.5rem 1rem;
  }
  
  table {
    font-size: 0.875rem;
  }
}
</style>
