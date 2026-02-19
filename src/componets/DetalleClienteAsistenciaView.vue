<script setup>
import { ref, onMounted, computed } from 'vue'
import { personasAPI, asuntosAPI, instanciasAPI, asistenciaAPI } from '@/services/api'

// Props
const props = defineProps({
  clienteId: Number,
  clienteNombre: String,
})

// Estados
const cliente = ref(null)
const asuntos = ref([])
const detallesAsuntos = ref({}) // { asuntoId: { instancias: [], detalles: {} } }
const loading = ref(false)
const error = ref(null)
const busqueda = ref('')
const debugInfo = ref('')

// Cargar datos del cliente
const cargarDatos = async () => {
  loading.value = true
  error.value = null
  debugInfo.value = ''
  
  try {
    console.log('=== INICIANDO CARGA DE DATOS ===')
    // Convertir clienteId a número
    const clienteIdNum = parseInt(props.clienteId, 10)
    console.log('ClienteId (número):', clienteIdNum, 'Tipo:', typeof clienteIdNum)
    
    // Cargar cliente
    if (clienteIdNum) {
      const resCliente = await personasAPI.getById(clienteIdNum)
      cliente.value = resCliente.data
      console.log('Cliente:', cliente.value)
    }
    
    // Cargar todos los asuntos
    const resAsuntos = await asuntosAPI.getAll()
    asuntos.value = resAsuntos.data
    console.log('Asuntos totales:', asuntos.value.length)
    
    // Para cada asunto, obtener instancias y asistencia del cliente
    for (const asunto of asuntos.value) {
      try {
        const resInstancias = await instanciasAPI.getByAsunto(asunto.id)
        const instancias = resInstancias.data || []
        console.log(`\n--- Asunto: ${asunto.nombre} (ID: ${asunto.id}) ---`)
        console.log(`Total instancias: ${instancias.length}`)
        
        // Obtener asistencia del cliente en este asunto
        const asistenciaPromises = instancias.map(inst => 
          asistenciaAPI.getByInstancia(inst.id)
            .then(res => {
              const registros = res.data || []
              console.log(`Instancia ${inst.id}: ${registros.length} registros`)
              
              const registro = registros.find(r => {
                // Comparar como números
                const rPersonaId = parseInt(r.persona_id, 10)
                const idMatch = rPersonaId === clienteIdNum
                console.log(`  r.persona_id=${r.persona_id} (número: ${rPersonaId}), clienteId=${clienteIdNum}, Match=${idMatch}`)
                return idMatch
              })
              
              console.log(`  Resultado: ${registro ? 'ENCONTRADO' : 'NO ENCONTRADO'}`, registro)
              
              return {
                instanciaId: inst.id,
                instancia: inst,
                asistio: registro?.asistio,
                registrado: !!registro,
              }
            })
            .catch(err => {
              console.error(`Error en instancia ${inst.id}:`, err)
              return {
                instanciaId: inst.id,
                instancia: inst,
                asistio: null,
                registrado: false,
              }
            })
        )
        
        const detallesInstancias = await Promise.all(asistenciaPromises)
        const conRegistro = detallesInstancias.filter(d => d.registrado)
        console.log(`Registros encontrados: ${conRegistro.length}`)
        
        detallesAsuntos.value[asunto.id] = {
          instancias: detallesInstancias,
          asunto: asunto,
        }
      } catch (err) {
        console.error(`Error cargando asunto ${asunto.id}:`, err)
        detallesAsuntos.value[asunto.id] = {
          instancias: [],
          asunto: asunto,
        }
      }
    }
    
    console.log('=== CARGA COMPLETADA ===')
    
  } catch (err) {
    error.value = err.message || 'Error al cargar datos'
    console.error('Error general:', err)
  } finally {
    loading.value = false
  }
}

// Filtrar solo asuntos donde el cliente está registrado EN AL MENOS UNA INSTANCIA
const asuntosRegistrados = computed(() => {
  return asuntos.value.filter(asunto => {
    const detalles = detallesAsuntos.value[asunto.id]
    const tieneRegistro = detalles && detalles.instancias.some(inst => inst.registrado)
    const coincideBusqueda = asunto.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    return tieneRegistro && coincideBusqueda
  })
})

// Obtener SOLO instancias registradas (no todas)
const instanciasRegistradas = (asuntoId) => {
  const detalles = detallesAsuntos.value[asuntoId]
  if (!detalles) return []
  return detalles.instancias.filter(inst => inst.registrado)
}

// Estadísticas por asunto
const estadisticasAsunto = (asuntoId) => {
  const instancias = instanciasRegistradas(asuntoId)
  const total = instancias.length
  const presentes = instancias.filter(i => i.asistio === true).length
  const ausentes = instancias.filter(i => i.asistio === false).length
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0
  
  return { total, presentes, ausentes, porcentaje }
}

// Estadísticas generales
const estadisticasGenerales = computed(() => {
  let totalInstancias = 0
  let presentes = 0
  let ausentes = 0
  
  asuntosRegistrados.value.forEach(asunto => {
    const stats = estadisticasAsunto(asunto.id)
    totalInstancias += stats.total
    presentes += stats.presentes
    ausentes += stats.ausentes
  })
  
  const porcentaje = totalInstancias > 0 
    ? Math.round((presentes / totalInstancias) * 100) 
    : 0
  
  return { totalInstancias, presentes, ausentes, porcentaje }
})

// Estado de asistencia como texto
const textoAsistencia = (asistio) => {
  return asistio ? 'Fue' : 'No fue'
}

const colorAsistencia = (asistio) => {
  return asistio ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="cliente-asistencia-container">
    <!-- Header del cliente -->
    <div v-if="cliente" class="bg-gradient-to-r from-muni-green-600 to-muni-green-700 text-white p-8 rounded-t-2xl">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-3xl font-bold">{{ cliente.nombre }} {{ cliente.apellido }}</h2>
          <div class="text-muni-green-100 text-sm mt-2 space-y-1">
            <p>RUT: {{ cliente.rut }}</p>
            <p>ID: {{ cliente.id }}</p>
          </div>
        </div>
      </div>

      <!-- Barra de búsqueda -->
      <div class="relative">
        <svg class="absolute left-3 top-3 w-5 h-5 text-muni-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="busqueda"
          type="text"
          placeholder="Buscar asunto..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-muni-green-200 focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-30 transition"
        >
      </div>
    </div>

    <div class="px-8 py-6 bg-muni-green-50">
      <!-- Estadísticas generales -->
      <div v-if="!loading && estadisticasGenerales.totalInstancias > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-muni-green-100 p-6">
          <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Total Asistencias</p>
          <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ estadisticasGenerales.totalInstancias }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
          <p class="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Fue</p>
          <p class="text-4xl font-bold text-emerald-900 mt-3">{{ estadisticasGenerales.presentes }}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-red-100 p-6">
          <p class="text-red-600 text-sm font-semibold uppercase tracking-wide">No Fue</p>
          <p class="text-4xl font-bold text-red-900 mt-3">{{ estadisticasGenerales.ausentes }}</p>
        </div>

        <div class="bg-gradient-to-br from-muni-green-400 to-muni-green-600 rounded-xl shadow-sm p-6 text-white">
          <p class="text-muni-green-100 text-sm font-semibold uppercase tracking-wide">Asistencia</p>
          <p class="text-4xl font-bold mt-3">{{ estadisticasGenerales.porcentaje }}%</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative w-16 h-16 mb-4">
          <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
        </div>
        <p class="text-muni-green-600 font-semibold">Cargando asuntos e instancias...</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <p class="text-red-800 font-semibold">{{ error }}</p>
      </div>

      <!-- Lista de asuntos con instancias registradas -->
      <div v-if="!loading && asuntosRegistrados.length > 0" class="space-y-6">
        <div v-for="asunto in asuntosRegistrados" :key="asunto.id" class="bg-white rounded-xl shadow-sm border border-muni-green-100 overflow-hidden">
          <!-- Header del asunto -->
          <div class="bg-gradient-to-r from-muni-green-100 to-muni-green-50 p-6 border-b border-muni-green-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-muni-green-900">{{ asunto.nombre }}</h3>
                <p class="text-muni-green-600 text-sm mt-1">{{ asunto.descripcion }}</p>
              </div>
              <div class="flex gap-2 text-xs whitespace-nowrap">
                <span class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                  Fue: {{ estadisticasAsunto(asunto.id).presentes }}
                </span>
                <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                  No fue: {{ estadisticasAsunto(asunto.id).ausentes }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tabla de instancias registradas -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muni-green-50 border-b border-muni-green-200">
                  <th class="px-6 py-3 text-left text-xs font-bold text-muni-green-800 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-muni-green-800 uppercase">Instancia</th>
                  <th class="px-6 py-3 text-center text-xs font-bold text-muni-green-800 uppercase">Asistencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-muni-green-100">
                <tr v-for="detalle in instanciasRegistradas(asunto.id)" :key="detalle.instanciaId" class="hover:bg-muni-green-50 transition">
                  <td class="px-6 py-3 text-sm text-muni-green-900 font-semibold">
                    {{ new Date(detalle.instancia.fecha).toLocaleDateString('es-ES') }}
                  </td>
                  <td class="px-6 py-3 text-sm text-muni-green-700">{{ detalle.instancia.nombre || `Instancia ${detalle.instanciaId}` }}</td>
                  <td class="px-6 py-3 text-center">
                    <span :class="['px-3 py-1 rounded-full text-xs font-semibold', colorAsistencia(detalle.asistio)]">
                      {{ textoAsistencia(detalle.asistio) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && asuntosRegistrados.length === 0 && busqueda === ''" class="text-center py-12">
        <svg class="w-16 h-16 text-muni-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-muni-green-600 text-lg font-semibold">Este cliente no está registrado en ningún asunto</p>
      </div>

      <!-- Sin resultados de búsqueda -->
      <div v-if="!loading && asuntosRegistrados.length === 0 && busqueda !== ''" class="text-center py-12">
        <svg class="w-16 h-16 text-muni-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-muni-green-600 text-lg font-semibold">No se encontraron asuntos con "{{ busqueda }}"</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cliente-asistencia-container {
  background-color: #f5f9f7;
  border-radius: 1rem;
  overflow: hidden;
}
</style>
