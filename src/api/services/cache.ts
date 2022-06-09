export const kv_cache = {
    get: async function (key: string): Promise<string | null> {
        return await CACHE.get(key)
    },
    set: async function (key: string, value: string): Promise<void> {
        return await CACHE.put(key, value)
    },
    remove: async function (key: string): Promise<void> {
        return await CACHE.delete(key)
    },
}