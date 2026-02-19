<script setup>
import { ref, onMounted, computed } from 'vue'
import { asuntosAPI, instanciasAPI, asistenciaAPI, personasAPI } from '@/services/api'

// Estados principales
const tab = ref('asuntos') // 'asuntos', 'crear', 'editar-asunto'
const asuntos = ref([])
const personas = ref([])
const loading = ref(false)
const error = ref(null)
const success = ref(null)

// Para crear asunto
const formAsunto = ref({
  nombre: '',
  tipo: 'taller',
  descripcion: '',
  coordinadora: '',
  lugar: ''
})

// Para instancias dentro del asunto
const asuntoActual = ref(null)
const instancias = ref([])
const formInstancia = ref({
  fecha: '',
  lugar: '',
  coordinadora: '',
  observaciones: ''
})

// Para buscar y registrar personas en instancia
const instanciaActual = ref(null)
const busquedaPersona = ref('')
const personasEnInstancia = ref([]) // Ya registradas
const personasDisponibles = computed(() => {
  return personas.value
    .filter(p => {
      const términoBúsqueda = busquedaPersona.value.toLowerCase()
      return (
        p.nombres.toLowerCase().includes(términoBúsqueda) ||
        p.apellidos.toLowerCase().includes(términoBúsqueda) ||
        p.rut.includes(términoBúsqueda)
      )
    })
    .filter(p => !personasEnInstancia.value.find(reg => reg.persona_id === p.id))
})

// Obtener asuntos
const obtenerAsuntos = async () => {
  loading.value = true
  try {
    const response = await asuntosAPI.getAll()
    asuntos.value = response.data || response
  } catch (err) {
    error.value = 'Error al obtener asuntos: ' + err.message
  } finally {
    loading.value = false
  }
}

// Obtener personas
const obtenerPersonas = async () => {
  try {
    const response = await personasAPI.getAll()
    personas.value = response.data || response
  } catch (err) {
    console.error('Error al obtener personas')
  }
}

// Crear asunto
const crearAsunto = async () => {
  loading.value = true
  error.value = null
  success.value = null
  
  try {
    const datos = {
      nombre: formAsunto.value.nombre,
      tipo: formAsunto.value.tipo,
      coordinadora: formAsunto.value.coordinadora,
      lugar: formAsunto.value.lugar,
      descripcion: formAsunto.value.descripcion || null
    }
    
    console.log('📤 Enviando datos:', datos)
    const response = await asuntosAPI.create(datos)
    const nuevoAsunto = response.data || response
    
    success.value = '✓ Asunto creado'
    asuntoActual.value = nuevoAsunto
    formAsunto.value = { nombre: '', tipo: 'taller', descripcion: '', coordinadora: '', lugar: '' }
    await obtenerAsuntos()
    await obtenerInstancias(nuevoAsunto.id)
    tab.value = 'editar-asunto'
    setTimeout(() => { success.value = null }, 2000)
  } catch (err) {
    console.error('❌ Error completo:', err)
    console.error('Response data:', err.response?.data)
    
    // Manejo de errores de validación de Pydantic
    if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
      const detalles = err.response.data.detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join(' | ')
      error.value = 'Errores de validación: ' + detalles
    } else if (err.response?.data?.detail) {
      error.value = 'Error al crear asunto: ' + err.response.data.detail
    } else {
      error.value = 'Error al crear asunto: ' + err.message
    }
  } finally {
    loading.value = false
  }
}

// Obtener instancias
const obtenerInstancias = async (asuntoId) => {
  try {
    const response = await asuntosAPI.getInstancias(asuntoId)
    instancias.value = response.data || response
  } catch (err) {
    console.error('Error al obtener instancias')
  }
}

// Formatear fecha para mostrar sin problemas de timezone
const formatearFechaVisual = (fechaString) => {
  if (!fechaString) return ''
  // fechaString viene como 'YYYY-MM-DD'
  const [año, mes, dia] = fechaString.split('-')
  return `${dia}/${mes}/${año}`
}

// Crear instancia y entrar a registrar personas
const crearInstancia = async () => {
  if (!asuntoActual.value || !formInstancia.value.fecha) {
    error.value = 'Completa la fecha para crear instancia'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const datos = {
      asunto_id: asuntoActual.value.id,
      fecha: formInstancia.value.fecha,
      lugar: formInstancia.value.lugar || null,
      coordinadora: formInstancia.value.coordinadora || null,
      observaciones: formInstancia.value.observaciones || null
    }
    
    const response = await instanciasAPI.create(datos)
    const nuevaInstancia = response.data || response
    
    success.value = '✓ Instancia creada'
    formInstancia.value = { fecha: '', lugar: '', coordinadora: '', observaciones: '' }
    await obtenerInstancias(asuntoActual.value.id)
    
    // Abrir instancia para registrar personas
    await abrirInstancia(nuevaInstancia)
    setTimeout(() => { success.value = null }, 2000)
  } catch (err) {
    console.error('Error detallado:', err.response?.data || err.message)
    error.value = 'Error al crear instancia: ' + (err.response?.data?.detail || err.message)
  } finally {
    loading.value = false
  }
}

// Abrir instancia para registrar/marcar asistencia
const abrirInstancia = async (instancia) => {
  instanciaActual.value = instancia
  busquedaPersona.value = ''
  
  try {
    const response = await instanciasAPI.getAsistencia(instancia.id)
    personasEnInstancia.value = response.data || response
  } catch (err) {
    personasEnInstancia.value = []
  }
}

// Registrar persona en instancia
const registrarPersona = async (persona) => {
  loading.value = true
  error.value = null
  
  try {
    const datos = {
      persona_id: persona.id,
      asunto_instancia_id: instanciaActual.value.id,
      asistio: false
    }
    
    await asistenciaAPI.create(datos)
    success.value = '✓ ' + persona.nombres + ' registrada'
    busquedaPersona.value = ''
    
    // Recargar personas en instancia
    const response = await instanciasAPI.getAsistencia(instanciaActual.value.id)
    personasEnInstancia.value = response.data || response
    
    setTimeout(() => { success.value = null }, 2000)
  } catch (err) {
    error.value = 'Error al registrar: ' + (err.response?.data?.detail || err.message)
  } finally {
    loading.value = false
  }
}

// Marcar/desmarcar asistencia
const cambiarAsistencia = async (registro) => {
  try {
    await asistenciaAPI.update(registro.id, { asistio: !registro.asistio })
    registro.asistio = !registro.asistio
    success.value = '✓ Asistencia actualizada'
    setTimeout(() => { success.value = null }, 1500)
  } catch (err) {
    error.value = 'Error al actualizar: ' + err.message
  }
}

// Eliminar registro
const eliminarRegistro = async (registroId) => {
  if (!confirm('¿Eliminar este registro?')) return
  
  try {
    await asistenciaAPI.delete(registroId)
    personasEnInstancia.value = personasEnInstancia.value.filter(r => r.id !== registroId)
    success.value = '✓ Registro eliminado'
  } catch (err) {
    error.value = 'Error al eliminar: ' + err.message
  }
}

// Volver
const volver = () => {
  if (instanciaActual.value) {
    instanciaActual.value = null
  } else if (tab.value === 'editar-asunto') {
    tab.value = 'asuntos'
    asuntoActual.value = null
  }
}

onMounted(() => {
  obtenerAsuntos()
  obtenerPersonas()
})
</script>

<template>
  <div class="gestion-container bg-gradient-to-br from-muni-green-50 via-white to-muni-green-50 min-h-screen">
    <!-- Header -->
    <div class="bg-gradient-to-r from-muni-green-700 to-muni-green-600 text-white p-8 border-b-4 border-muni-green-500">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 class="text-4xl font-bold">Gestión de Asuntos & Asistencia</h2>
            <p class="text-muni-green-100 text-sm mt-1">Organiza eventos, talleres e instancias de asistencia</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    <div class="max-w-6xl mx-auto px-6 py-4">
      <div v-if="error" class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-4">
        <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800 font-semibold">{{ error }}</p>
      </div>
      <div v-if="success" class="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start gap-4">
        <svg class="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-emerald-800 font-semibold">{{ success }}</p>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-6xl mx-auto px-6 pb-12">
      <!-- TAB 1: Lista de Asuntos -->
      <div v-if="tab === 'asuntos'">
        <button 
          @click="tab = 'crear'"
          class="mb-8 flex items-center gap-2 bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Crear Nuevo Asunto
        </button>

        <div v-if="loading" class="text-center py-16">
          <div class="relative w-16 h-16 mx-auto mb-4">
            <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 bg-muni-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <p class="text-muni-green-600 font-semibold text-lg">Cargando asuntos...</p>
        </div>

        <div v-if="!loading && asuntos.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 text-center">
          <svg class="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2" />
          </svg>
          <p class="text-yellow-800 font-semibold text-lg">No hay asuntos creados</p>
          <p class="text-yellow-700 text-sm mt-2">Crea el primero para comenzar</p>
        </div>

        <div v-if="!loading && asuntos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="asunto in asuntos" 
            :key="asunto.id"
            @click="asuntoActual = asunto; tab = 'editar-asunto'; obtenerInstancias(asunto.id)"
            class="bg-white border-2 border-muni-green-100 rounded-xl shadow-sm hover:shadow-xl hover:border-muni-green-300 transition duration-300 p-6 cursor-pointer transform hover:scale-105"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-bold text-muni-green-900 flex-1">{{ asunto.nombre }}</h3>
              <span class="text-xs font-semibold px-3 py-1 rounded-full" :class="
                asunto.tipo === 'taller' ? 'bg-blue-100 text-blue-700' :
                asunto.tipo === 'entrega' ? 'bg-emerald-100 text-emerald-700' :
                'bg-purple-100 text-purple-700'
              ">
                {{ asunto.tipo }}
              </span>
            </div>
            <p class="text-muni-green-700 text-sm mb-4 line-clamp-2">{{ asunto.descripcion || 'Sin descripción' }}</p>
            <div class="space-y-2 text-sm mb-4">
              <p class="text-muni-green-800"><strong>👤 Coordinadora:</strong> {{ asunto.coordinadora }}</p>
              <p class="text-muni-green-800"><strong>📍 Lugar:</strong> {{ asunto.lugar }}</p>
            </div>
            <div class="bg-gradient-to-r from-muni-green-50 to-muni-green-100 rounded-lg p-3 text-center border border-muni-green-200">
              <p class="text-2xl font-bold text-muni-green-600">{{ asunto.instancias || 0 }}</p>
              <p class="text-xs text-muni-green-700 font-semibold">Instancias</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Crear Asunto -->
      <div v-if="tab === 'crear'">
        <button 
          @click="tab = 'asuntos'"
          class="mb-6 flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <div class="bg-white rounded-2xl shadow-lg border border-muni-green-100 p-8 max-w-3xl">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-muni-green-400 to-muni-green-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-muni-green-900">Crear Nuevo Asunto</h3>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Nombre *</label>
              <input 
                v-model="formAsunto.nombre" 
                type="text"
                placeholder="Ej: Taller de Huertos Urbanos"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Tipo *</label>
                <select 
                  v-model="formAsunto.tipo"
                  class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
                >
                  <option value="taller">Taller</option>
                  <option value="entrega">Entrega</option>
                  <option value="otra">Otra</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Coordinadora *</label>
                <input 
                  v-model="formAsunto.coordinadora" 
                  type="text"
                  placeholder="Nombre completo"
                  class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Lugar *</label>
              <input 
                v-model="formAsunto.lugar" 
                type="text"
                placeholder="Ej: Parque Central, Salón Comunitario"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>

            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Descripción</label>
              <textarea 
                v-model="formAsunto.descripcion"
                placeholder="Describe brevemente el asunto..."
                rows="4"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              ></textarea>
            </div>

            <button 
              @click="crearAsunto"
              :disabled="!formAsunto.nombre || !formAsunto.coordinadora || !formAsunto.lugar"
              class="w-full bg-gradient-to-r from-muni-green-500 to-muni-green-600 hover:from-muni-green-600 hover:to-muni-green-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Crear Asunto
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: Editar Asunto -->
      <div v-if="tab === 'editar-asunto' && asuntoActual && !instanciaActual">
        <button 
          @click="volver"
          class="mb-6 flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <!-- Info del asunto -->
        <div class="bg-gradient-to-r from-muni-green-500 to-muni-green-600 text-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 class="text-3xl font-bold mb-2">{{ asuntoActual.nombre }}</h3>
          <p class="text-muni-green-100 mb-4">{{ asuntoActual.descripcion || 'Sin descripción específica' }}</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-muni-green-400">
            <div>
              <p class="text-xs text-muni-green-100 uppercase tracking-wide font-semibold">Tipo</p>
              <p class="text-lg font-bold mt-1 capitalize">{{ asuntoActual.tipo }}</p>
            </div>
            <div>
              <p class="text-xs text-muni-green-100 uppercase tracking-wide font-semibold">Coordinadora</p>
              <p class="text-lg font-bold mt-1">{{ asuntoActual.coordinadora }}</p>
            </div>
            <div>
              <p class="text-xs text-muni-green-100 uppercase tracking-wide font-semibold">Lugar</p>
              <p class="text-lg font-bold mt-1">{{ asuntoActual.lugar }}</p>
            </div>
          </div>
        </div>

        <!-- Crear instancia -->
        <div class="bg-white rounded-2xl shadow-lg border border-muni-green-100 p-8 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-muni-green-900">Crear Nueva Instancia</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Fecha *</label>
              <input 
                v-model="formInstancia.fecha" 
                type="date"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Lugar (opcional)</label>
              <input 
                v-model="formInstancia.lugar" 
                type="text"
                :placeholder="asuntoActual.lugar"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Coordinadora (opcional)</label>
              <input 
                v-model="formInstancia.coordinadora" 
                type="text"
                :placeholder="asuntoActual.coordinadora"
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-muni-green-800 mb-2 uppercase tracking-wide">Observaciones</label>
              <input 
                v-model="formInstancia.observaciones" 
                type="text"
                placeholder="Notas adicionales..."
                class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition"
              >
            </div>
          </div>
          <button 
            @click="crearInstancia"
            :disabled="!formInstancia.fecha"
            class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Instancia
          </button>
        </div>

        <!-- Lista de instancias -->
        <div v-if="loading" class="text-center py-12">
          <div class="relative w-16 h-16 mx-auto mb-4">
            <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 bg-muni-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <p class="text-muni-green-600 font-semibold">Cargando instancias...</p>
        </div>

        <div v-if="!loading && instancias.length > 0">
          <h4 class="text-2xl font-bold text-muni-green-900 mb-6 flex items-center gap-2">
            <svg class="w-6 h-6 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instancias Creadas ({{ instancias.length }})
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="inst in instancias" 
              :key="inst.id"
              @click="abrirInstancia(inst)"
              class="bg-white border-2 border-muni-green-100 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-muni-green-300 transition duration-300 transform hover:scale-105"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <p class="text-xl font-bold text-muni-green-900">{{ formatearFechaVisual(inst.fecha) }}</p>
                  <p class="text-muni-green-600 text-sm mt-1">{{ inst.lugar || asuntoActual.lugar }}</p>
                </div>
                <svg class="w-6 h-6 text-muni-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div class="grid grid-cols-2 gap-3 pt-4 border-t border-muni-green-100">
                <div class="bg-muni-green-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-muni-green-700 font-semibold uppercase">Registrados</p>
                  <p class="text-2xl font-bold text-muni-green-600 mt-1">{{ inst.registrados || 0 }}</p>
                </div>
                <div class="bg-emerald-50 rounded-lg p-3 text-center">
                  <p class="text-xs text-emerald-700 font-semibold uppercase">Presentes</p>
                  <p class="text-2xl font-bold text-emerald-600 mt-1">{{ inst.presentes || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && instancias.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 text-center">
          <svg class="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 0v2" />
          </svg>
          <p class="text-yellow-800 font-semibold">No hay instancias creadas</p>
          <p class="text-yellow-700 text-sm mt-1">Crea una instancia arriba para comenzar a registrar personas</p>
        </div>
      </div>

      <!-- TAB 4: Registrar/Marcar Asistencia en Instancia -->
      <div v-if="tab === 'editar-asunto' && instanciaActual">
        <button 
          @click="volver"
          class="mb-6 flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <!-- Info instancia -->
        <div class="bg-gradient-to-r from-muni-green-500 to-muni-green-600 text-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 class="text-3xl font-bold mb-2">{{ asuntoActual.nombre }}</h3>
          <div class="flex items-center gap-4 mt-4">
            <span class="text-muni-green-100 flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{{ formatearFechaVisual(instanciaActual.fecha) }}</span>
            <span class="text-muni-green-100 flex items-center gap-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{{ instanciaActual.lugar }}</span>
          </div>
        </div>

        <!-- Búsqueda y registro de personas -->
        <div class="bg-white rounded-2xl shadow-lg border border-muni-green-100 p-8 mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4a4 4 0 110 8 4 4 0 010-8zM12 14a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
            <h4 class="text-2xl font-bold text-muni-green-900">Buscar y Registrar Personas</h4>
          </div>
          
          <input 
            v-model="busquedaPersona" 
            type="text"
            placeholder="Busca por nombre o RUT..."
            class="w-full px-4 py-3 border-2 border-muni-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-muni-green-500 focus:border-transparent transition mb-4"
          >

          <div v-if="personasDisponibles.length === 0 && busquedaPersona === ''" class="text-center py-8">
            <p class="text-muni-green-600 font-semibold">✓ Todas las personas están registradas</p>
          </div>

          <div v-if="personasDisponibles.length === 0 && busquedaPersona !== ''" class="text-center py-8">
            <p class="text-muni-green-600 font-semibold">Sin resultados para tu búsqueda</p>
          </div>

          <div v-if="personasDisponibles.length > 0" class="space-y-2 max-h-80 overflow-y-auto">
            <button 
              v-for="persona in personasDisponibles" 
              :key="persona.id"
              @click="registrarPersona(persona)"
              class="w-full text-left bg-gradient-to-r from-muni-green-50 to-muni-green-100 hover:from-muni-green-100 hover:to-muni-green-200 border-2 border-muni-green-200 rounded-lg p-4 transition duration-300 flex justify-between items-center group"
            >
              <div>
                <p class="font-semibold text-muni-green-900">{{ persona.nombres }} {{ persona.apellidos }}</p>
                <p class="text-sm text-muni-green-700 font-mono">{{ persona.rut }}</p>
              </div>
              <span class="bg-muni-green-500 text-white px-3 py-2 rounded-lg font-bold text-sm group-hover:bg-muni-green-600 transition">+ Registrar</span>
            </button>
          </div>
        </div>

        <!-- Tabla personas registradas -->
        <div v-if="loading" class="text-center py-12">
          <div class="relative w-16 h-16 mx-auto mb-4">
            <div class="absolute inset-0 bg-muni-green-400 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 bg-muni-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <p class="text-muni-green-600 font-semibold">Cargando personas...</p>
        </div>

        <div v-if="!loading && personasEnInstancia.length > 0">
          <h4 class="text-2xl font-bold text-muni-green-900 mb-6 flex items-center gap-2">
            <svg class="w-6 h-6 text-muni-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a7 7 0 1114 0v-2H6v2z" />
            </svg>
            Personas Registradas ({{ personasEnInstancia.length }})
          </h4>
          <div class="bg-white rounded-2xl shadow-lg border border-muni-green-100 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-muni-green-200 bg-gradient-to-r from-muni-green-50 to-muni-green-100">
                  <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">Nombre</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-muni-green-800 uppercase tracking-widest">RUT</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Asistencia</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-muni-green-800 uppercase tracking-widest">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-muni-green-100">
                <tr 
                  v-for="(reg, index) in personasEnInstancia" 
                  :key="reg.id"
                  :class="[
                    'transition duration-300 group',
                    index % 2 === 0 ? 'bg-white hover:bg-muni-green-50' : 'bg-muni-green-25 hover:bg-muni-green-75'
                  ]"
                >
                  <td class="px-6 py-4 text-muni-green-900 font-semibold">{{ reg.nombre }}</td>
                  <td class="px-6 py-4 text-muni-green-700 font-mono text-sm bg-muni-green-100 px-3 py-1 rounded-lg max-w-fit">{{ reg.rut }}</td>
                  <td class="px-6 py-4 text-center">
                    <button 
                      @click="cambiarAsistencia(reg)"
                      :class="[
                        'px-4 py-2 rounded-lg font-bold text-white transition duration-300 transform hover:scale-110',
                        reg.asistio 
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md' 
                          : 'bg-red-400 hover:bg-red-500 shadow-md'
                      ]"
                    >
                      {{ reg.asistio ? '✓ Presente' : '✗ Ausente' }}
                    </button>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button 
                      @click="eliminarRegistro(reg.id)"
                      class="text-red-600 hover:text-red-800 hover:bg-red-50 font-bold text-2xl p-2 rounded-lg transition duration-300"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gestion-container {
  min-height: 100vh;
}

@media (max-width: 768px) {
  .gestion-container {
    font-size: 0.9rem;
  }
}
</style>
