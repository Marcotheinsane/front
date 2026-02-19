<script setup>
import { ref, onMounted, computed } from 'vue'
import { asistenciaAPI } from '@/services/api'

// Estados
const registrosAsistencia = ref([])
const loading = ref(false)
const error = ref(null)
const filtroPersona = ref('')
const filtroFecha = ref('')
const guardando = ref({}) // Control de guardado por registro

// Obtener asistencia
const obtenerAsistencia = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Intentar diferentes endpoints hasta encontrar datos
    let response
    try {
      response = await asistenciaAPI.getByInstancia(1) // Intenta primer endpoint
    } catch {
      // Si falla, intenta otro
      response = await fetch('http://localhost:8000/asistencia/').then(r => r.json())
    }
    
    registrosAsistencia.value = response.data || response
    console.log('Asistencia cargada:', registrosAsistencia.value)
  } catch (err) {
    error.value = 'Error al obtener asistencia: ' + err.message
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Filtrados
const registrosFiltrados = computed(() => {
  return registrosAsistencia.value.filter(reg => {
    const coincidePersona = !filtroPersona.value || 
      (reg.nombre || '').toLowerCase().includes(filtroPersona.value.toLowerCase()) ||
      (reg.rut || '').includes(filtroPersona.value)
    
    const coincideFecha = !filtroFecha.value || 
      (reg.fecha || '').includes(filtroFecha.value)
    
    return coincidePersona && coincideFecha
  })
})

// Estadísticas
const estadisticas = computed(() => {
  const total = registrosFiltrados.value.length
  const presentes = registrosFiltrados.value.filter(r => r.asistio === true).length
  const ausentes = registrosFiltrados.value.filter(r => r.asistio === false).length
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0
  
  return { total, presentes, ausentes, porcentaje }
})

// Guardar un registro
const guardarRegistro = async (registro) => {
  guardando.value[registro.id] = 'guardando'
  
  try {
    // Conectar con el backend
    await asistenciaAPI.update(registro.id, { asistio: registro.asistio })
    
    guardando.value[registro.id] = 'guardado'
    
    // Mostrar mensaje de éxito por 2 segundos
    setTimeout(() => {
      guardando.value[registro.id] = null
    }, 2000)
    
    console.log('Registro guardado:', registro)
  } catch (err) {
    guardando.value[registro.id] = 'error'
    console.error('Error al guardar:', err)
    
    setTimeout(() => {
      guardando.value[registro.id] = null
    }, 3000)
  }
}

const recargar = () => {
  obtenerAsistencia()
}

const exportarCSV = () => {
  let csv = 'Fecha,Persona,RUT,Asunto,Instancia,Asistió,Coordinadora\n'
  registrosFiltrados.value.forEach(reg => {
    csv += `"${reg.fecha || ''}","${reg.nombre || ''}","${reg.rut || ''}","${reg.asunto || ''}","${reg.instancia_fecha || ''}","${reg.asistio ? 'Sí' : 'No'}","${reg.coordinadora || ''}"\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'asistencia.csv'
  a.click()
}

onMounted(() => {
  obtenerAsistencia()
})
</script>

<template>
  <div class="asistencia-container">
    <!-- Header -->
    <div class="bg-gradient-to-r from-muni-green-600 to-muni-green-700 text-white p-8 rounded-t-2xl">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-3xl font-bold">Registro de Asistencia</h2>
            <p class="text-muni-green-100 text-sm mt-1">Gestión y seguimiento de asistencias</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            @click="recargar"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.581 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          <button 
            @click="exportarCSV"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8H3m15-8h3" />
            </svg>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <div class="px-8 py-6 bg-muni-green-50">
      <!-- Estadísticas -->
      <div v-if="!loading && registrosAsistencia.length > 0" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-muni-green-100 p-6 hover:shadow-md transition duration-300">
          <p class="text-muni-green-600 text-sm font-semibold uppercase tracking-wide">Total Registros</p>
          <p class="text-4xl font-bold text-muni-green-900 mt-3">{{ estadisticas.total }}</p>
          <div class="w-full bg-muni-green-200 rounded-full h-2 mt-4">
            <div class="bg-muni-green-600 h-2 rounded-full" style="width: 100%"></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 hover:shadow-md transition duration-300">
          <p class="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Presentes</p>
          <p class="text-4xl font-bold text-emerald-900 mt-3">{{ estadisticas.presentes }}</p>
          <div class="w-full bg-emerald-200 rounded-full h-2 mt-4">
            <div class="bg-emerald-600 h-2 rounded-full" :style="{ width: estadisticas.porcentaje + '%' }"></div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-red-100 p-6 hover:shadow-md transition duration-300">
          <p class="text-red-600 text-sm font-semibold uppercase tracking-wide">Ausentes</p>
          <p class="text-4xl font-bold text-red-900 mt-3">{{ estadisticas.ausentes }}</p>
          <div class="w-full bg-red-200 rounded-full h-2 mt-4">
            <div class="bg-red-600 h-2 rounded-full" :style="{ width: (100 - estadisticas.porcentaje) + '%' }"></div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-muni-green-400 to-muni-green-600 rounded-xl shadow-sm p-6 text-white">
          <p class="text-muni-green-100 text-sm font-semibold uppercase tracking-wide">Porcentaje</p>
          <p class="text-4xl font-bold mt-3">{{ estadisticas.porcentaje }}%</p>
          <p class="text-muni-green-100 text-sm mt-4">de asistencia</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl shadow-sm border border-muni-green-100 p-6 mb-8">
        <h3 class="text-lg font-bold text-muni-green-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Filtrar por Persona/RUT</label>
            <input 
              v-model="filtroPersona"
              type="text" 
              placeholder="Escribe un nombre o RUT..."
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
            >
          </div>
          <div>
            <label class="block text-sm font-semibold text-muni-green-800 mb-2">Filtrar por Fecha</label>
            <input 
              v-model="filtroFecha"
              type="date"
              class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
            >
          </div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="text-center py-16">
        <div class="relative w-16 h-16 mx-auto mb-4">
          <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
          <div class="absolute inset-0 bg-muni-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <p class="text-muni-green-600 font-semibold text-lg">Cargando registro de asistencia...</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 flex items-start gap-4">
        <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-red-800 font-semibold">{{ error }}</p>
        </div>
      </div>

      <!-- Tabla de asistencia -->
      <div v-if="!loading && registrosFiltrados.length > 0" class="bg-white rounded-xl shadow-sm border border-muni-green-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-muni-green-200 bg-gradient-to-r from-muni-green-50 to-muni-green-100">
                <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Persona</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">RUT</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Asunto</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Coordinadora</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Asistencia</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-muni-green-100">
              <tr 
                v-for="(registro, index) in registrosFiltrados" 
                :key="registro.id"
                :class="[
                  'transition duration-300 group',
                  index % 2 === 0 ? 'bg-white hover:bg-muni-green-50' : 'bg-muni-green-25 hover:bg-muni-green-75'
                ]"
              >
                <td class="px-6 py-4 text-muni-green-900 font-semibold">
                  {{ registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-CL') : '-' }}
                </td>
                <td class="px-6 py-4 text-muni-green-800 font-medium">{{ registro.nombre || '-' }}</td>
                <td class="px-6 py-4 text-muni-green-700 font-mono text-sm bg-muni-green-100 px-3 py-1 rounded-lg">{{ registro.rut || '-' }}</td>
                <td class="px-6 py-4">
                  <div>
                    <p class="font-semibold text-muni-green-800">{{ registro.asunto || '-' }}</p>
                    <p class="text-sm text-muni-green-600">{{ registro.instancia_fecha ? new Date(registro.instancia_fecha).toLocaleDateString('es-CL') : '-' }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-muni-green-800">{{ registro.coordinadora || '-' }}</td>
                
                <!-- Asistencia editable -->
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center">
                    <label class="inline-flex items-center cursor-pointer group/toggle">
                      <input 
                        type="checkbox" 
                        v-model="registro.asistio"
                        class="w-6 h-6 rounded border-2 border-muni-green-300 focus:ring-2 focus:ring-muni-green-500 cursor-pointer accent-muni-green-600"
                      >
                      <span class="ml-3 text-sm font-bold transition duration-300" :class="registro.asistio ? 'text-emerald-600' : 'text-red-600'">
                        <span v-if="registro.asistio">✓ Presente</span>
                        <span v-else>✗ Ausente</span>
                      </span>
                    </label>
                  </div>
                </td>

                <!-- Botón guardar -->
                <td class="px-6 py-4 text-center">
                  <button 
                    @click="guardarRegistro(registro)"
                    :disabled="guardando[registro.id] === 'guardando'"
                    :class="[
                      'font-semibold py-2 px-4 rounded-lg text-sm transition duration-300 transform hover:scale-105',
                      guardando[registro.id] === 'guardando' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                      guardando[registro.id] === 'guardado' ? 'bg-emerald-500 text-white' :
                      guardando[registro.id] === 'error' ? 'bg-red-500 text-white' :
                      'bg-muni-green-500 hover:bg-muni-green-600 text-white shadow-md'
                    ]"
                  >
                    <span v-if="guardando[registro.id] === 'guardando'">⏳ Guardando</span>
                    <span v-else-if="guardando[registro.id] === 'guardado'">✓ Guardado</span>
                    <span v-else-if="guardando[registro.id] === 'error'">⚠ Error</span>
                    <span v-else>💾 Guardar</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sin registros -->
      <div v-if="!loading && registrosAsistencia.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0v-2m0 6h2m-2 0h-2" />
        </svg>
        <p class="text-yellow-800 font-semibold text-lg">No hay registros de asistencia disponibles</p>
        <p class="text-yellow-700 text-sm mt-2">Crea instancias y registra asistencia para que aparezcan aquí</p>
      </div>

      <!-- Sin resultados en filtro -->
      <div v-if="!loading && registrosAsistencia.length > 0 && registrosFiltrados.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-yellow-800 font-semibold text-lg">No hay registros que coincidan con los filtros</p>
        <p class="text-yellow-700 text-sm mt-2">Intenta cambiar los filtros para ver todos los registros</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asistencia-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Prevenir scroll horizontal en móviles */
@media (max-width: 768px) {
  .asistencia-container {
    border-radius: 0;
    margin: 0;
  }
  
  table {
    font-size: 0.875rem;
  }
}
</style>
