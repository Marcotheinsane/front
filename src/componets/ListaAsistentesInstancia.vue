<script setup>
import { ref, onMounted, computed } from 'vue'
import { asistenciaAPI } from '@/services/api'

// Props
const props = defineProps({
  instanciaId: {
    type: Number,
    required: true
  }
})

// Estados
const asistentes = ref([])
const cargando = ref(true)
const error = ref(null)
const filtro = ref('todos') // 'todos', 'asistio', 'inasistencia'

// Cargar asistentes
const cargarAsistentes = async () => {
  cargando.value = true
  error.value = null
  
  try {
    const respuesta = await asistenciaAPI.getByInstancia(props.instanciaId)
    asistentes.value = respuesta.data || []
    console.log(`Asistentes cargados para instancia ${props.instanciaId}:`, asistentes.value.length)
  } catch (err) {
    error.value = 'Error al cargar asistentes'
    console.error('Error:', err)
  } finally {
    cargando.value = false
  }
}

// Filtrar asistentes
const asistentesFiltrados = computed(() => {
  if (filtro.value === 'asistio') {
    return asistentes.value.filter(a => a.asistio === true)
  } else if (filtro.value === 'inasistencia') {
    return asistentes.value.filter(a => a.asistio === false)
  }
  return asistentes.value
})

// Cambiar estado de asistencia
const cambiarAsistencia = async (registroId, nuevoEstado) => {
  try {
    const respuesta = await asistenciaAPI.update(registroId, { asistio: nuevoEstado })
    
    // Actualizar el registro local
    const indice = asistentes.value.findIndex(a => a.id === registroId)
    if (indice !== -1) {
      asistentes.value[indice].asistio = nuevoEstado
    }
    
    console.log('Asistencia actualizada:', respuesta.data)
  } catch (err) {
    error.value = 'Error al actualizar asistencia'
    console.error('Error:', err)
  }
}

// Estadísticas
const estadisticas = computed(() => {
  const total = asistentes.value.length
  const asistio = asistentes.value.filter(a => a.asistio === true).length
  const inasistencia = total - asistio
  const porcentaje = total > 0 ? Math.round((asistio / total) * 100) : 0
  
  return { total, asistio, inasistencia, porcentaje }
})

// Ciclo de vida
onMounted(() => {
  cargarAsistentes()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Total -->
      <div class="bg-white rounded-xl border-2 border-muni-green-200 p-4">
        <p class="text-xs text-muni-green-600 font-semibold uppercase">Total Registrados</p>
        <p class="text-3xl font-bold text-muni-green-900 mt-2">{{ estadisticas.total }}</p>
      </div>

      <!-- Asistió -->
      <div class="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-4">
        <p class="text-xs text-emerald-600 font-semibold uppercase">Asistieron</p>
        <p class="text-3xl font-bold text-emerald-900 mt-2">{{ estadisticas.asistio }}</p>
      </div>

      <!-- Inasistencia -->
      <div class="bg-orange-50 rounded-xl border-2 border-orange-200 p-4">
        <p class="text-xs text-orange-600 font-semibold uppercase">Inasistencia</p>
        <p class="text-3xl font-bold text-orange-900 mt-2">{{ estadisticas.inasistencia }}</p>
      </div>

      <!-- Porcentaje -->
      <div class="bg-muni-green-50 rounded-xl border-2 border-muni-green-200 p-4">
        <p class="text-xs text-muni-green-600 font-semibold uppercase">Porcentaje</p>
        <p class="text-3xl font-bold text-muni-green-900 mt-2">{{ estadisticas.porcentaje }}%</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-2">
      <button
        @click="filtro = 'todos'"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition-all',
          filtro === 'todos'
            ? 'bg-muni-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Todos ({{ asistentes.length }})
      </button>
      <button
        @click="filtro = 'asistio'"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition-all',
          filtro === 'asistio'
            ? 'bg-emerald-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Asistió ({{ asistentes.filter(a => a.asistio).length }})
      </button>
      <button
        @click="filtro = 'inasistencia'"
        :class="[
          'px-4 py-2 rounded-lg font-semibold transition-all',
          filtro === 'inasistencia'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]"
      >
        Inasistencia ({{ asistentes.filter(a => !a.asistio).length }})
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="cargando" class="flex justify-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-muni-green-200 border-t-muni-green-500 rounded-full animate-spin"></div>
        <p class="text-gray-600 font-semibold">Cargando asistentes...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
      <p class="text-red-800 font-semibold">{{ error }}</p>
    </div>

    <!-- Tabla de asistentes -->
    <div v-else class="bg-white rounded-xl border-2 border-muni-green-100 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-muni-green-50 border-b-2 border-muni-green-200">
            <th class="px-6 py-4 text-left text-sm font-bold text-muni-green-900">Nombre</th>
            <th class="px-6 py-4 text-left text-sm font-bold text-muni-green-900">RUT</th>
            <th class="px-6 py-4 text-center text-sm font-bold text-muni-green-900">Estado</th>
            <th class="px-6 py-4 text-right text-sm font-bold text-muni-green-900">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="asistente in asistentesFiltrados" 
            :key="asistente.id"
            class="border-b border-gray-200 hover:bg-muni-green-50 transition"
          >
            <!-- Nombre -->
            <td class="px-6 py-4">
              <div class="font-semibold text-gray-900">
                {{ asistente.persona?.nombres }} {{ asistente.persona?.apellidos }}
              </div>
            </td>

            <!-- RUT -->
            <td class="px-6 py-4">
              <div class="text-gray-600 font-mono text-sm">{{ asistente.persona?.rut || '-' }}</div>
            </td>

            <!-- Estado actual -->
            <td class="px-6 py-4 text-center">
              <span 
                v-if="asistente.asistio"
                class="inline-flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-800 font-semibold rounded-full text-sm"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Asistió
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 font-semibold rounded-full text-sm"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Inasistencia
              </span>
            </td>

            <!-- Acciones -->
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button
                  v-if="!asistente.asistio"
                  @click="cambiarAsistencia(asistente.id, true)"
                  class="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition text-sm"
                >
                  Marcar Asistencia
                </button>
                <button
                  v-if="asistente.asistio"
                  @click="cambiarAsistencia(asistente.id, false)"
                  class="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition text-sm"
                >
                  Marcar Inasistencia
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div v-if="asistentesFiltrados.length === 0" class="py-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <p class="text-gray-600 font-semibold">No hay asistentes con este filtro</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
