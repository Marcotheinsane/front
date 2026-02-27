<template>
<nav class="sticky top-0 z-50 bg-gradient-to-r from-muni-green-700 via-muni-green-600 to-muni-green-700 border-b-2 border-muni-green-500 shadow-lg">
  <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
    <!-- Logo municipal y título -->
    <div class="flex items-center gap-3">
      <!-- Logo Municipal Blanco (si existe) -->
      <div class="flex items-center justify-center">
        <img 
          src="/logo-municipal-blanco.svg" 
          alt="Logo Municipal" 
          class="h-10 w-10 object-contain drop-shadow-lg transition duration-300 hover:scale-110" 
          onerror="this.style.display='none'"
        />
      </div>
      <!-- Icono de respaldo si no hay logo -->
      <div class="w-10 h-10 bg-gradient-to-br from-muni-green-300 to-muni-green-500 rounded-lg flex items-center justify-center transform hover:scale-110 transition duration-300 shadow-md">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div>
        <router-link to="/" class="font-bold text-xl text-white hover:text-muni-green-100 transition duration-300 tracking-wider">
          TREKAN
        </router-link>
        <p class="text-xs text-muni-green-200">PDTI Sistema Municipal</p>
      </div>
    </div>

    <!-- Menu principal -->
    <ul class="hidden md:flex items-center gap-8">
      <li>
        <router-link 
          to="/" 
          class="text-muni-green-100 hover:text-white transition duration-300 flex items-center gap-2 font-medium group relative"
        >
          <svg class="w-5 h-5 group-hover:scale-110 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v8" />
          </svg>
          Panel Principal
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
        </router-link>
      </li>
      <li>
        <router-link 
          to="/instancias" 
          class="text-muni-green-100 hover:text-white transition duration-300 flex items-center gap-2 font-medium group relative"
        >
          <svg class="w-5 h-5 group-hover:scale-110 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m7 8a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
          Gestión
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
        </router-link>
      </li>
    </ul>

    <!-- Contacto y Mobile menu -->
    <div class="flex items-center gap-4">
      <!-- Icono contacto (desktop) -->
      <a 
        href="mailto:soporte@municipio.gov" 
        class="hidden md:flex items-center gap-2 text-muni-green-100 hover:text-white transition duration-300 text-sm font-medium group"
        title="Enviar correo a soporte"
      >
        <svg class="w-5 h-5 group-hover:scale-110 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </a>

      <!-- Mobile menu button -->
      <button class="md:hidden text-muni-green-100 hover:text-white transition duration-300 p-2 rounded-lg hover:bg-muni-green-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</nav>
</template>

<style scoped>
/* Las transiciones están en Tailwind */
</style>