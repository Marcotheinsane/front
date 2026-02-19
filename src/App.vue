<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
    <router-view />
  </div>
</template>

<style scoped>
/* Estilos del componente raíz */
#app {
  animation: fadeIn 0.5s ease-in-out;
  min-height: 100vh;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
