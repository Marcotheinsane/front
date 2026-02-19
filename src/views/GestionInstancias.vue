<script setup>
import { ref, onMounted } from 'vue'
import nabvar from '@/componets/nabvar.vue'
import ListaInstancias from '@/componets/ListaInstancias.vue'
import ListaAsuntos from '@/componets/ListaAsuntos.vue'
import FormularioAgregarInstancia from '@/componets/FormularioAgregarInstancia.vue'
import FormularioAgregarAsunto from '@/componets/FormularioAgregarAsunto.vue'
import { asuntosAPI, instanciasAPI, asistenciaAPI } from '@/services/api'

// Filtros
const busqueda = ref('')
const anoSeleccionado = ref(new Date().getFullYear())
const anos = [2025, 2026]

// Control para recargar la lista
const recargarKey = ref(0)
const recargarKeyAsuntos = ref(0)

// Pestañas
const tabActiva = ref('instancias') // 'instancias' o 'asuntos'

// Estadísticas
const totalInstancias = ref(0)
const instanciasProximas = ref(0)
const asistentesRegistrados = ref(0)

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

// Recargar lista cuando se agrega una instancia
const recargarLista = () => {
  cargarEstadisticas()
  recargarKey.value++
}

// Recargar lista de asuntos
const handleAsuntoAgregado = () => {
  recargarKeyAsuntos.value++
  cargarEstadisticas()
}

// Cargar estadísticas
const cargarEstadisticas = async () => {
  try {
    // Obtener todos los asuntos
    const respuestaAsuntos = await asuntosAPI.getAll()
    const asuntos = respuestaAsuntos.data || []
    
    let todasInstancias = []
    let totalAsistentes = 0
    let proximasCount = 0
    
    const hoy = new Date()
    const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
    
    // Iterar por cada asunto para obtener instancias
    for (const asunto of asuntos) {
      try {
        const respuestaInstancias = await instanciasAPI.getByAsunto(asunto.id)
        const instancias = respuestaInstancias.data || []
        
        for (const instancia of instancias) {
          // Parsing de la fecha
          const fechaParts = instancia.fecha.split('-')
          const año = parseInt(fechaParts[0])
          const mes = parseInt(fechaParts[1])
          const dia = parseInt(fechaParts[2])
          
          // Si el año es del filtro, agregar a conteo
          if (año === anoSeleccionado.value) {
            todasInstancias.push(instancia)
            
            // Verificar si es próxima (en el próximo mes)
            const fechaInstancia = new Date(año, mes - 1, dia)
            if (fechaInstancia >= hoy && fechaInstancia < proximoMes) {
              proximasCount++
            }
          }
        }
        
        // Obtener asistentes de las instancias
        for (const instancia of instancias) {
          try {
            const respuestaAsistencia = await asistenciaAPI.getByInstancia(instancia.id)
            totalAsistentes += (respuestaAsistencia.data || []).length
          } catch (err) {
            console.log('No hay asistencia para instancia:', instancia.id)
          }
        }
      } catch (err) {
        console.log('Error obteniendo instancias del asunto:', asunto.id)
      }
    }
    
    totalInstancias.value = todasInstancias.length
    instanciasProximas.value = proximasCount
    asistentesRegistrados.value = totalAsistentes
    
    console.log('Estadísticas cargadas:', {
      totalInstancias: totalInstancias.value,
      proximasInstancias: instanciasProximas.value,
      asistentes: asistentesRegistrados.value
    })
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
  }
}

// Ciclo de vida
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-muni-green-900">Gestión Municipal</h1>
            <p class="text-muni-green-600 text-lg mt-1">Sistema de Gestión de Instancias, Asuntos y Asistencia</p>
          </div>
        </div>
      </div>

      <!-- Cards de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Card Total Instancias -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Total Instancias</p>
              <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ totalInstancias }}</p>
              <p class="text-muni-green-500 text-xs mt-2">Reuniones programadas {{ anoSeleccionado }}</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Próximas Instancias -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Próximas Instancias</p>
              <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ instanciasProximas }}</p>
              <p class="text-muni-green-500 text-xs mt-2">En este mes</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Card Asistentes Registrados -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-8 hover:shadow-xl hover:border-muni-green-300 transition duration-300 group">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Asistentes Registrados</p>
              <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ asistentesRegistrados }}</p>
              <p class="text-muni-green-500 text-xs mt-2">En instancias del año</p>
            </div>
            <div class="w-16 h-16 bg-gradient-to-br from-muni-green-100 to-muni-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg class="w-8 h-8 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas -->
      <div class="mb-8">
        <div class="flex gap-4 border-b-2 border-muni-green-200">
          <button
            @click="tabActiva = 'instancias'"
            :class="[
              'px-6 py-3 font-bold text-lg transition-all duration-300',
              tabActiva === 'instancias'
                ? 'text-muni-green-600 border-b-4 border-muni-green-600 bg-muni-green-50'
                : 'text-gray-600 hover:text-muni-green-500'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
              </svg>
              Instancias
            </span>
          </button>
          <button
            @click="tabActiva = 'asuntos'"
            :class="[
              'px-6 py-3 font-bold text-lg transition-all duration-300',
              tabActiva === 'asuntos'
                ? 'text-muni-green-600 border-b-4 border-muni-green-600 bg-muni-green-50'
                : 'text-gray-600 hover:text-muni-green-500'
            ]"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Asuntos
            </span>
          </button>
        </div>
      </div>

      <!-- Contenido de Instancias -->
      <div v-if="tabActiva === 'instancias'" class="space-y-8">
        <!-- Filtros y búsqueda -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-6">
          <h3 class="text-lg font-bold text-muni-green-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros y búsqueda
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Búsqueda por fecha, asunto o descripción -->
            <div>
              <label class="block text-sm font-semibold text-muni-green-800 mb-2">Buscar instancia</label>
              <div class="relative">
                <svg class="absolute left-3 top-3 w-5 h-5 text-muni-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  v-model="busqueda"
                  @input="actualizarFiltros"
                  type="text" 
                  placeholder="Fecha, asunto o descripción..."
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
                    🔍 {{ busqueda }}
                  </span>
                  <span class="inline-block bg-muni-green-200 text-muni-green-800 px-2 py-1 rounded text-xs font-semibold">
                    📅 {{ anoSeleccionado }}
                  </span>
                </p>
              </div>
              <!-- Botón agregar instancia -->
              <FormularioAgregarInstancia @instancia-agregada="recargarLista" />
            </div>
          </div>
        </div>

        <!-- Lista de Instancias -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 overflow-hidden hover:shadow-lg transition duration-300">
          <ListaInstancias :key="recargarKey" :filtros="filtros" />
        </div>
      </div>

      <!-- Contenido de Asuntos -->
      <div v-if="tabActiva === 'asuntos'" class="space-y-8">
        <!-- Header de Asuntos con botón de agregar -->
        <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-muni-green-100 p-6">
          <div>
            <h3 class="text-lg font-bold text-muni-green-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Gestión de Asuntos
            </h3>
            <p class="text-sm text-gray-600 mt-1">Crea, edita y elimina temas de reunión/asuntos</p>
          </div>
          <FormularioAgregarAsunto @asunto-agregado="handleAsuntoAgregado" />
        </div>

        <!-- Búsqueda de asuntos -->
        <div class="bg-white rounded-2xl shadow-sm border border-muni-green-100 p-6">
          <div class="relative">
            <svg class="absolute left-3 top-3 w-5 h-5 text-muni-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              v-model="busqueda"
              type="text" 
              placeholder="Buscar por nombre o descripción..."
              class="w-full pl-10 pr-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
            >
          </div>
        </div>

        <!-- Lista de Asuntos -->
        <ListaAsuntos :key="recargarKeyAsuntos" :filtros="{ busqueda }" />
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
