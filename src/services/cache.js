// Simple caching service para evitar consultas repetidas
const cache = new Map()

export default {
    set: (key, value, ttl = 5 * 60 * 1000) => {
        const expiration = Date.now() + ttl
        cache.set(key, { value, expiration })
    },

    get: (key) => {
        const item = cache.get(key)
        if (!item) return null

        if (Date.now() > item.expiration) {
            cache.delete(key)
            return null
        }

        return item.value
    },

    clear: () => cache.clear(),

    remove: (key) => cache.delete(key),
}
