import { computed } from 'vue'
import { authAPI } from '@/services/auth'

export function usePermissions() {
    const user = authAPI.getCurrentUser()

    // Verificar si es un usuario demo
    const isDemo = computed(() => {
        return user?.rol === 'usuario' || user?.username === 'demo'
    })

    // Verificar si es admin
    const isAdmin = computed(() => {
        return user?.rol === 'admin'
    })

    // Verificar si puede crear
    const canCreate = computed(() => {
        return !isDemo.value
    })

    // Verificar si puede editar
    const canEdit = computed(() => {
        return !isDemo.value
    })

    // Verificar si puede eliminar
    const canDelete = computed(() => {
        return !isDemo.value
    })

    // Verificar si puede solo ver (lectura)
    const canOnlyView = computed(() => {
        return isDemo.value
    })

    // Verificar si puede acceder basado en cantidad de registros
    const canAccessWithLimit = (count) => {
        // Demo solo puede ver si hay <= 10 registros
        if (isDemo.value) {
            return count <= 10
        }
        // Admin puede ver siempre
        return true
    }

    // Mensaje de restricción para demo
    const getDemoRestrictionMessage = () => {
        return 'Esta acción no está disponible en modo demo. Los usuarios demo solo pueden ver datos.'
    }

    const getRecordLimitMessage = () => {
        return 'El acceso en modo demo está limitado a 10 registros o menos. Actual: más de 10 registros.'
    }

    return {
        user,
        isDemo,
        isAdmin,
        canCreate,
        canEdit,
        canDelete,
        canOnlyView,
        canAccessWithLimit,
        getDemoRestrictionMessage,
        getRecordLimitMessage
    }
}
