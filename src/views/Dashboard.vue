<script setup>
import { ref, onMounted } from 'vue'
import nabvar from '@/componets/nabvar.vue'
import ListaClientes from '@/componets/ListaClientes.vue'
import FormularioAgregarCliente from '@/componets/FormularioAgregarCliente.vue'
import { personasAPI, asuntosAPI, instanciasAPI, asistenciaAPI } from '@/services/api'

// Filtros
const busqueda = ref('')
const anoSeleccionado = ref(new Date().getFullYear())
const anos = [2025, 2026]

// Control para recargar la lista
const recargarKey = ref(0)

// Estadísticas
const totalClientes = ref(0)
const totalAsuntos = ref(0)
const porcentajeAsistencias = ref(0)

// Pasar props al componente hijo
const filtros = ref({
  busqueda: '',
  ano: anoSeleccionado.value
})

const actualizarFiltros = () => {
  filtros.value = {
    busqueda: busqueda.value,
    ano: anoSeleccionado.value
  }
}

// Recargar lista cuando se agrega un cliente
const recargarLista = () => {
  recargarKey.value++
  cargarEstadisticas()
}

// Cargar estadísticas
const cargarEstadisticas = async () => {
  try {
    // Total de clientes
    const responseClientes = await personasAPI.getAll()
    totalClientes.value = responseClientes.data?.length || 0
    console.log('Total clientes:', totalClientes.value)

    // Total de asuntos
    const responseAsuntos = await asuntosAPI.getAll()
    totalAsuntos.value = responseAsuntos.data?.length || 0
    console.log('Total asuntos:', totalAsuntos.value)

    // Calcular porcentaje de asistencias hoy
    const hoy = new Date()
    const fechaHoy = hoy.toISOString().split('T')[0]
    
    let totalRegistros = 0
    let totalAsistencias = 0

    // Obtener instancias de hoy
    const asuntos = responseAsuntos.data || []
    for (const asunto of asuntos) {
      try {
        const responseInstancias = await instanciasAPI.getByAsunto(asunto.id)
        const instancias = responseInstancias.data || []
        
        // Filtrar instancias de hoy
        const instanciasHoy = instancias.filter(inst => inst.fecha === fechaHoy)
        
        for (const instancia of instanciasHoy) {
          try {
            const responseAsistencia = await asistenciaAPI.getByInstancia(instancia.id)
            const registrosAsistencia = responseAsistencia.data || []
            
            totalRegistros += registrosAsistencia.length
            totalAsistencias += registrosAsistencia.filter(r => r.asistio === true).length
          } catch (err) {
            console.warn('Error obteniendo asistencia:', err)
          }
        }
      } catch (err) {
        console.warn('Error obteniendo instancias:', err)
      }
    }

    // Calcular porcentaje
    if (totalRegistros > 0) {
      porcentajeAsistencias.value = Math.round((totalAsistencias / totalRegistros) * 100)
    } else {
      porcentajeAsistencias.value = 0
    }
    
    console.log(`Asistencias: ${totalAsistencias}/${totalRegistros} = ${porcentajeAsistencias.value}%`)
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
  }
}

// Cargar estadísticas al montar el componente
onMounted(() => {
  cargarEstadisticas()
})
</script>

<template>
  <nabvar />
  <main class="min-h-screen bg-gradient-to-br from-muni-green-50 via-white to-muni-green-50">
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-muni-green-400 to-muni-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-muni-green-900">Panel de Control</h1>
            <p class="text-muni-green-600 text-lg mt-1">Sistema de Gestión Municipal</p>
          </div>
        </div>
      </div>

      <!-- Cards de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Card Clientes -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Total Clientes</p>
              <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ totalClientes }}</p>
              <p class="text-muni-green-500 text-xs mt-2">Personas registradas</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Asuntos -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Asuntos Registrados</p>
              <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ totalAsuntos }}</p>
              <p class="text-muni-green-500 text-xs mt-2">En el sistema</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Asistencias -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Asistencias Hoy</p>
              <div class="flex items-center gap-2 mt-3">
                <p class="text-4xl font-bold text-muni-green-900">{{ porcentajeAsistencias }}%</p>
                <div :class="[
                  'px-3 py-1 rounded-full text-xs font-bold',
                  porcentajeAsistencias >= 80 ? 'bg-emerald-100 text-emerald-800' :
                  porcentajeAsistencias >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  porcentajeAsistencias > 0 ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ porcentajeAsistencias >= 80 ? '✓ Alto' : porcentajeAsistencias >= 60 ? '≈ Medio' : porcentajeAsistencias > 0 ? '! Bajo' : '- Sin datos' }}
                </div>
              </div>
              <p class="text-muni-green-500 text-xs mt-2">Registradas</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-6 mb-8">
        <h3 class="text-lg font-bold text-muni-green-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros y búsqueda
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Búsqueda por nombre o RUT -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Buscar cliente</label>
            <div class="relative">
              <svg class="absolute left-3 top-3 w-5 h-5 text-muni-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                v-model="busqueda"
                @input="actualizarFiltros"
                type="text" 
                placeholder="Nombre, RUT o apellido..."
                class="w-full pl-10 pr-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>
          </div>

          <!-- Filtro por año -->
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Filtrar por año</label>
            <select 
              v-model="anoSeleccionado"
              @change="actualizarFiltros"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition bg-white"
            >
              <option v-for="ano in anos" :key="ano" :value="ano">
                Año {{ ano }}
              </option>
            </select>
          </div>

          <!-- Info de filtros activos -->
          <div class="flex items-end gap-2">
            <div class="flex-1 bg-muni-green-50 border-2 border-muni-green-200 rounded-lg p-3">
              <p class="text-xs text-muni-green-600 font-semibold uppercase">Filtros activos</p>
              <p class="text-sm text-muni-green-900 mt-1">
                <span v-if="busqueda" class="inline-block bg-muni-green-200 text-muni-green-800 px-2 py-1 rounded mr-2 text-xs font-semibold">
                  📝 {{ busqueda }}
                </span>
                <span class="inline-block bg-muni-green-200 text-muni-green-800 px-2 py-1 rounded text-xs font-semibold">
                  📅 {{ anoSeleccionado }}
                </span>
              </p>
            </div>
            <!-- Botón agregar cliente -->
            <FormularioAgregarCliente @cliente-agregado="recargarLista" />
          </div>
        </div>
      </div>

      <!-- Lista de Clientes -->
      <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 overflow-hidden hover:shadow-lg transition duration-300">
        <ListaClientes :key="recargarKey" :filtros="filtros" />
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
