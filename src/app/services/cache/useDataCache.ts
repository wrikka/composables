import { computed, ref } from "vue";

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl?: number;
}

interface UseDataCacheOptions {
	ttl?: number;
	maxSize?: number;
	storage?: "memory" | "localStorage" | "sessionStorage";
}

export function useDataCache<T = any>(options: UseDataCacheOptions = {}) {
	const { ttl = 300000, maxSize = 100, storage = "memory" } = options;

	const cache = ref<Map<string, CacheEntry<T>>>(new Map());

	const isStorageAvailable = (type: string): boolean => {
		try {
			const storageKey = `__storage_test_${Date.now()}`;
			window[type as Storage].setItem(storageKey, "");
			window[type as Storage].removeItem(storageKey);
			return true;
		} catch {
			return false;
		}
	};

	const getStorage = (): Storage | null => {
		if (storage === "memory" || !isStorageAvailable(storage)) return null;
		return window[storage];
	};

	const loadFromStorage = () => {
		const storage = getStorage();
		if (!storage) return;

		try {
			const cached = storage.getItem("data_cache");
			if (cached) {
				const parsed = JSON.parse(cached);
				const newCache = new Map<string, CacheEntry<T>>();
				Object.entries(parsed).forEach(([key, value]) => {
					newCache.set(key, value as CacheEntry<T>);
				});
				cache.value = newCache;
			}
		} catch {
			// Ignore errors
		}
	};

	const saveToStorage = () => {
		const storage = getStorage();
		if (!storage) return;

		try {
			const obj = Object.fromEntries(cache.value.entries());
			storage.setItem("data_cache", JSON.stringify(obj));
		} catch {
			// Ignore errors
		}
	};

	const isExpired = (entry: CacheEntry<T>): boolean => {
		if (!entry.ttl) return false;
		return Date.now() - entry.timestamp > entry.ttl;
	};

	const get = (key: string): T | null => {
		const entry = cache.value.get(key);
		if (!entry) return null;

		if (isExpired(entry)) {
			cache.value.delete(key);
			saveToStorage();
			return null;
		}

		return entry.data;
	};

	const set = (key: string, data: T, customTtl?: number) => {
		const entry: CacheEntry<T> = {
			data,
			timestamp: Date.now(),
			ttl: customTtl ?? ttl,
		};

		cache.value.set(key, entry);

		if (cache.value.size > maxSize) {
			const firstKey = cache.value.keys().next().value;
			cache.value.delete(firstKey);
		}

		saveToStorage();
	};

	const has = (key: string): boolean => {
		const entry = cache.value.get(key);
		if (!entry) return false;
		if (isExpired(entry)) {
			cache.value.delete(key);
			saveToStorage();
			return false;
		}
		return true;
	};

	const remove = (key: string) => {
		cache.value.delete(key);
		saveToStorage();
	};

	const clear = () => {
		cache.value.clear();
		saveToStorage();
	};

	const size = computed(() => cache.value.size);

	const keys = computed(() => Array.from(cache.value.keys()));

	const values = computed(() => Array.from(cache.value.values()));

	const entries = computed(() => Array.from(cache.value.entries()));

	const cleanup = () => {
		const now = Date.now();
		for (const [key, entry] of cache.value.entries()) {
			if (entry.ttl && now - entry.timestamp > entry.ttl) {
				cache.value.delete(key);
			}
		}
		saveToStorage();
	};

	const getStats = () => ({
		size: cache.value.size,
		maxSize,
		hitRate: 0,
		misses: 0,
	});

	if (storage !== "memory") {
		loadFromStorage();
	}

	return {
		cache,
		size,
		keys,
		values,
		entries,
		get,
		set,
		has,
		remove,
		clear,
		cleanup,
		getStats,
	};
}
