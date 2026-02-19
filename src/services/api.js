import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Funciones para Personas/Clientes
export const personasAPI = {
    getAll: () => api.get("/personas/"),
    getById: (id) => api.get(`/personas/${id}`),
    create: (data) => api.post("/personas/", data),
    update: (id, data) => api.put(`/personas/${id}`, data),
    delete: (id) => api.delete(`/personas/${id}`),
}

// Funciones para Asuntos (Talleres, Entregas, etc)
export const asuntosAPI = {
    getAll: () => api.get("/asuntos/"),
    getById: (id) => api.get(`/asuntos/${id}`),
    create: (data) => api.post("/asuntos/", data),
    update: (id, data) => api.put(`/asuntos/${id}`, data),
    delete: (id) => api.delete(`/asuntos/${id}`),
    getInstancias: (asuntoId) => api.get(`/asuntos/${asuntoId}/instancias/`),
}

// Funciones para Instancias (Fechas específicas de cada asunto)
export const instanciasAPI = {
    getAll: () => api.get("/instancias/"),
    getByAsunto: (asuntoId) => api.get(`/asuntos/${asuntoId}/instancias/`),
    getById: (id) => api.get(`/instancias/${id}`),
    create: (data) => api.post("/instancias/", data),
    update: (id, data) => api.put(`/instancias/${id}`, data),
    delete: (id) => api.delete(`/instancias/${id}`),
    getAsistencia: (instanciaId) => api.get(`/instancias/${instanciaId}/asistencia/`),
}

// Funciones para Asistencia
export const asistenciaAPI = {
    getByInstancia: (instanciaId) => api.get(`/instancias/${instanciaId}/asistencia/`),
    getByPersona: (personaId) => api.get(`/personas/${personaId}/asistencia/`),
    create: (data) => api.post("/asistencia/", data),
    update: (id, data) => api.put(`/asistencia/${id}`, data),
    delete: (id) => api.delete(`/asistencia/${id}`),
    registrarPersona: (instanciaId, data) => api.post(`/instancias/${instanciaId}/registrar`, data),
    marcarAsistencia: (instanciaId, personaId, asistio) => api.put(`/asistencia/marcar`, { instancia_id: instanciaId, persona_id: personaId, asistio }),
}

export default api;