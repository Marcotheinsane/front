import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import GestionInstancias from '../views/GestionInstancias.vue'
import DetalleClienteAsistencia from '../views/DetalleClienteAsistencia.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/instancias',
        name: 'GestionInstancias',
        component: GestionInstancias
    },
    {
        path: '/clientes/:clienteId/asistencia',
        name: 'DetalleClienteAsistencia',
        component: DetalleClienteAsistencia,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
