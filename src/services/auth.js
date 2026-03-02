import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Agregar token a los headers si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const authAPI = {
    // Login
    login: (username, password) => api.post('/login/', { username, password }),

    // Logout
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },

    // Verificar token
    verificarToken: () => api.get('/me/'),

    // Obtener usuario actual
    getCurrentUser: () => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },

    // Guardar token
    setToken: (token) => {
        localStorage.setItem('token', token)
    },

    // Guardar usuario
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user))
    },

    // Verificar si está autenticado
    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    }
}
