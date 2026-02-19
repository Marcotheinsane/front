<script setup>
import { ref, onMounted } from 'vue'
// import { asistenciaAPI } from '@/services/api'

const props = defineProps({
  asunto: Object,
  instancia: Object,
  required: true
})

const emit = defineEmits(['volver'])

const registros = ref([])
const loading = ref(false)

const obtenerAsistencia = async () => {
  loading.value = true
  try {
    // TODO: const response = await asistenciaAPI.getByInstancia(props.instancia.id)
    // MOCK DATA
    registros.value = [
      {
        id: 1,
        persona_id: 1,
        nombre: 'Juan Pérez',
        rut: '12.345.678-9',
        asistio: true
      },
      {
        id: 2,
        persona_id: 2,
        nombre: 'María García',
        rut: '13.456.789-0',
        asistio: true
      },
      {
        id: 3,
        persona_id: 3,
        nombre: 'Pedro López',
        rut: '14.567.890-1',
        asistio: false
      },
      {
        id: 4,
        persona_id: 4,
        nombre: 'Ana Martínez',
        rut: '15.678.901-2',
        asistio: true
      },
      {
        id: 5,
        persona_id: 5,
        nombre: 'Carlos Rodríguez',
        rut: '16.789.012-3',
        asistio: false
      }
    ]
  } finally {
    loading.value = false
  }
}

const toggleAsistencia = async (registro) => {
  registro.asistio = !registro.asistio
  // TODO: await asistenciaAPI.updateAsistencia(registro.id, { asistio: registro.asistio })
}

const guardarCambios = async () => {
  try {
    // TODO: Guardar todos los cambios en batch
    alert('Cambios guardados')
  } catch (err) {
    alert('Error al guardar: ' + err.message)
  }
}

const contarPresentes = () => {
  return registros.value.filter(r => r.asistio).length
}

const contarAusentes = () => {
  return registros.value.filter(r => !r.asistio).length
}

onMounted(() => {
  obtenerAsistencia()
})
</script>

<template>
  <div>
    <button 
      @click="emit('volver')"
      class="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
    >
      ← Volver
    </button>

    <!-- Header con info -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ asunto.nombre }}</h2>
          <p class="text-gray-600">
            {{ new Date(instancia.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">Coordinadora</p>
          <p class="font-semibold">{{ instancia.coordinadora }}</p>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-gray-100 rounded p-3 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ registros.length }}</p>
          <p class="text-xs text-gray-600">Registrados</p>
        </div>
        <div class="bg-green-100 rounded p-3 text-center">
          <p class="text-2xl font-bold text-green-600">{{ contarPresentes() }}</p>
          <p class="text-xs text-gray-600">Presentes</p>
        </div>
        <div class="bg-red-100 rounded p-3 text-center">
          <p class="text-2xl font-bold text-red-600">{{ contarAusentes() }}</p>
          <p class="text-xs text-gray-600">Ausentes</p>
        </div>
      </div>
    </div>

    <!-- Matriz de asistencia -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Cargando asistencia...</p>
    </div>

    <div v-if="!loading && registros.length === 0" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      No hay personas registradas para esta instancia
    </div>

    <div v-if="!loading && registros.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-100 border-b">
          <tr>
            <th class="px-4 py-3 text-left text-gray-700 font-semibold">Nombre</th>
            <th class="px-4 py-3 text-left text-gray-700 font-semibold">RUT</th>
            <th class="px-4 py-3 text-center text-gray-700 font-semibold">Asistencia</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="registro in registros" 
            :key="registro.id"
            class="border-b hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3 text-gray-800 font-medium">{{ registro.nombre }}</td>
            <td class="px-4 py-3 text-gray-600 font-mono">{{ registro.rut }}</td>
            <td class="px-4 py-3 text-center">
              <label class="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="registro.asistio"
                  @change="toggleAsistencia(registro)"
                  class="w-5 h-5 text-green-600 rounded focus:ring-2"
                >
                <span class="ml-2 text-sm" :class="registro.asistio ? 'text-green-600 font-semibold' : 'text-gray-500'">
                  {{ registro.asistio ? 'Presente' : 'Ausente' }}
                </span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Botón guardar -->
    <div class="mt-6 flex justify-end">
      <button 
        @click="guardarCambios"
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded"
      >
        ✓ Guardar Asistencia
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
