<template>
  <footer class="bg-gradient-to-r from-muni-green-900 via-muni-green-800 to-muni-green-900 border-t-4 border-muni-green-600 text-white mt-16">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <!-- Logo y descripción -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img src="/logo-municipal-blanco.svg" alt="Logo Municipal" class="h-12 w-12 object-contain" />
            <h3 class="font-bold text-xl tracking-wider">TREKAN - PDTI</h3>
          </div>
          <p class="text-muni-green-200 text-sm leading-relaxed">
            Sistema de Gestión Municipal para la administración y seguimiento de asuntos, clientes e instancias.
          </p>
        </div>

        <!-- Enlaces rápidos -->
        <div>
          <h4 class="font-bold text-lg mb-4 text-muni-green-100 border-b border-muni-green-700 pb-2">
            Acceso Rápido
          </h4>
          <ul class="space-y-3">
            <li>
              <router-link 
                to="/" 
                class="text-muni-green-200 hover:text-white transition duration-300 flex items-center gap-2 group"
              >
                <span class="group-hover:translate-x-1 transition duration-300">→</span>
                Panel Principal
              </router-link>
            </li>
            <li>
              <router-link 
                to="/instancias" 
                class="text-muni-green-200 hover:text-white transition duration-300 flex items-center gap-2 group"
              >
                <span class="group-hover:translate-x-1 transition duration-300">→</span>
                Gestión de Instancias
              </router-link>
            </li>
            <li>
              <router-link 
                to="/asuntos" 
                class="text-muni-green-200 hover:text-white transition duration-300 flex items-center gap-2 group"
              >
                <span class="group-hover:translate-x-1 transition duration-300">→</span>
                Gestión de Asuntos
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Información -->
        <div>
          <h4 class="font-bold text-lg mb-4 text-muni-green-100 border-b border-muni-green-700 pb-2">
            Información
          </h4>
          <ul class="space-y-3 text-muni-green-200 text-sm">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              <a href="mailto:soporte@municipio.gov" class="hover:text-white transition">
                soporte@municipio.gov
              </a>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.058.3.234.646.597 1.01.36.365.706.54 1.005.597l.773-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 011-1h2z"></path>
              </svg>
              <a href="tel:+123456789" class="hover:text-white transition">
                +1 (234) 567-89
              </a>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <span class="hover:text-white transition">
                Ciudad, País
              </span>
            </li>
          </ul>
        </div>

        <!-- Horario -->
        <div>
          <h4 class="font-bold text-lg mb-4 text-muni-green-100 border-b border-muni-green-700 pb-2">
            Horario de Atención
          </h4>
          <ul class="space-y-2 text-muni-green-200 text-sm">
            <li class="flex justify-between">
              <span>Lunes - Viernes:</span>
              <span>08:00 - 17:00</span>
            </li>
            <li class="flex justify-between">
              <span>Sábado:</span>
              <span>09:00 - 13:00</span>
            </li>
            <li class="flex justify-between">
              <span>Domingo:</span>
              <span>Cerrado</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-muni-green-700 pt-8 mt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-muni-green-300 text-sm mb-4 md:mb-0">
            © {{ new Date().getFullYear() }} Municipalidad. Todos los derechos reservados.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-muni-green-300 hover:text-white transition duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" class="text-muni-green-300 hover:text-white transition duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
              </svg>
            </a>
            <a href="#" class="text-muni-green-300 hover:text-white transition duration-300">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>
