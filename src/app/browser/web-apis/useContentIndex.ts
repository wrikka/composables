import { ref } from "vue";

export interface ContentIndexState {
  add: (id: string, content: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
  search: (query: string) => Promise<any[]>;
  isAdding: boolean;
  isRemoving: boolean;
  isSearching: boolean;
  error: Error | null;
}

export function useContentIndex() {
  const isAdding = ref(false);
  const isRemoving = ref(false);
  const isSearching = ref(false);
  const error = ref<Error | null>(null);

  const add = async (id: string, content: any): Promise<void> => {
    isAdding.value = true;
    error.value = null;

    try {
      const index = await navigator.indexedDB.open("content-index", 1);
      const tx = index.transaction(["content"], "readwrite");
      const store = tx.objectStore("content");
      await store.put({ id, content });
    } catch (err) {
      error.value = err as Error;
    } finally {
      isAdding.value = false;
    }
  };

  const remove = async (id: string): Promise<void> => {
    isRemoving.value = true;
    error.value = null;

    try {
      const index = await navigator.indexedDB.open("content-index", 1);
      const tx = index.transaction(["content"], "readwrite");
      const store = tx.objectStore("content");
      await store.delete(id);
    } catch (err) {
      error.value = err as Error;
    } finally {
      isRemoving.value = false;
    }
  };

  const search = async (query: string): Promise<any[]> => {
    isSearching.value = true;
    error.value = null;

    try {
      const index = await navigator.indexedDB.open("content-index", 1);
      const tx = index.transaction(["content"], "readonly");
      const store = tx.objectStore("content");
      const results = await store.getAll();
      return results.filter((item: any) => item.content.toLowerCase().includes(query.toLowerCase()));
    } catch (err) {
      error.value = err as Error;
      return [];
    } finally {
      isSearching.value = false;
    }
  };

  return {
    add,
    remove,
    search,
    isAdding,
    isRemoving,
    isSearching,
    error,
  };
}
