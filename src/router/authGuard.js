import { authAPI } from '@/services/auth'

export function setupAuthGuard(router) {
    router.beforeEach((to, from, next) => {
        const isAuthenticated = authAPI.isAuthenticated()
        const isLoginRoute = to.name === 'Login'

        // Si no está autenticado y no es ruta de login
        if (!isAuthenticated && !isLoginRoute) {
            next({ name: 'Login' })
        }
        // Si está autenticado y trata de ir a login
        else if (isAuthenticated && isLoginRoute) {
            next({ name: 'Dashboard' })
        }
        // Si está autenticado o es login, permitir acceso
        else {
            next()
        }
    })
}
