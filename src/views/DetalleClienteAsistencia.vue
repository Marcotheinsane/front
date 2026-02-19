<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import nabvar from '@/componets/nabvar.vue'
import DetalleClienteAsistencia from '@/componets/DetalleClienteAsistenciaView.vue'

const router = useRouter()
const route = useRoute()

const clienteId = ref(route.params.clienteId)
const clienteNombre = ref(route.params.clienteNombre || '')

const volverAtras = () => {
  router.push('/clientes')
}
</script>

<template>
  <nabvar />
  <div class="min-h-screen bg-gradient-to-b from-muni-green-50 to-muni-green-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Botón volver -->
      <button 
        @click="volverAtras"
        class="mb-6 flex items-center gap-2 text-muni-green-600 hover:text-muni-green-800 font-semibold transition duration-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a Clientes
      </button>

      <!-- Componente de detalle -->
      <DetalleClienteAsistencia :clienteId="clienteId" :clienteNombre="clienteNombre" />
    </div>
  </div>
</template>

<style scoped>
</style>
