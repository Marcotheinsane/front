<script setup>
import { ref, onMounted } from 'vue'
// import { asuntoAPI } from '@/services/api'
import MatrizAsistencia from './MatrizAsistencia.vue'

const props = defineProps({
  asunto: Object,
  required: true
})

const emit = defineEmits(['volver'])

const instancias = ref([])
const instanciaSeleccionada = ref(null)
const loading = ref(false)

const obtenerInstancias = async () => {
  loading.value = true
  try {
    // TODO: const response = await asuntoAPI.getInstancias(props.asunto.id)
    // MOCK DATA
    instancias.value = [
      {
        id: 1,
        fecha: '2026-02-15',
        lugar: props.asunto.lugar,
        coordinadora: props.asunto.coordinadora,
        registrados: 12,
        presentes: 10
      },
      {
        id: 2,
        fecha: '2026-03-20',
        lugar: props.asunto.lugar,
        coordinadora: props.asunto.coordinadora,
        registrados: 15,
        presentes: 12
      },
      {
        id: 3,
        fecha: '2026-04-18',
        lugar: props.asunto.lugar,
        coordinadora: props.asunto.coordinadora,
        registrados: 10,
        presentes: 0
      }
    ]
  } finally {
    loading.value = false
  }
}

const seleccionarInstancia = (instancia) => {
  instanciaSeleccionada.value = instancia
}

const volverInstancias = () => {
  instanciaSeleccionada.value = null
}

onMounted(() => {
  obtenerInstancias()
})
</script>

<template>
  <div>
    <!-- Si no hay instancia seleccionada -->
    <div v-if="!instanciaSeleccionada">
      <button 
        @click="emit('volver')"
        class="mb-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
      >
        ← Volver a Asuntos
      </button>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ asunto.nombre }}</h2>
        <p class="text-gray-600 mb-4">{{ asunto.descripcion }}</p>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Coordinadora</p>
            <p class="font-semibold text-gray-800">{{ asunto.coordinadora }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Lugar Base</p>
            <p class="font-semibold text-gray-800">{{ asunto.lugar }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Tipo</p>
            <p class="font-semibold text-gray-800 capitalize">{{ asunto.tipo }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Instancias</p>
            <p class="font-semibold text-gray-800">{{ instancias.length }}</p>
          </div>
        </div>
      </div>

      <h3 class="text-xl font-bold text-gray-800 mb-4">Historial de Fechas</h3>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Cargando instancias...</p>
      </div>

      <div v-if="!loading && instancias.length === 0" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No hay instancias registradas
      </div>

      <!-- Tabla de instancias -->
      <div v-if="!loading && instancias.length > 0" class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-4 py-3 text-left text-gray-700 font-semibold">Fecha</th>
              <th class="px-4 py-3 text-left text-gray-700 font-semibold">Lugar</th>
              <th class="px-4 py-3 text-left text-gray-700 font-semibold">Coordinadora</th>
              <th class="px-4 py-3 text-center text-gray-700 font-semibold">Registrados</th>
              <th class="px-4 py-3 text-center text-gray-700 font-semibold">Presentes</th>
              <th class="px-4 py-3 text-center text-gray-700 font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="inst in instancias" 
              :key="inst.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-gray-800">{{ new Date(inst.fecha).toLocaleDateString('es-CL') }}</td>
              <td class="px-4 py-3 text-gray-800">{{ inst.lugar }}</td>
              <td class="px-4 py-3 text-gray-800">{{ inst.coordinadora }}</td>
              <td class="px-4 py-3 text-center text-gray-800 font-semibold">{{ inst.registrados }}</td>
              <td class="px-4 py-3 text-center">
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded font-semibold">
                  {{ inst.presentes }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button 
                  @click="seleccionarInstancia(inst)"
                  class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Si hay instancia seleccionada, mostrar matriz -->
    <MatrizAsistencia 
      v-else
      :asunto="asunto"
      :instancia="instanciaSeleccionada"
      @volver="volverInstancias"
    />
  </div>
</template>

<style scoped>
</style>
