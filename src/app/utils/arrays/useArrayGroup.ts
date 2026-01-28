import { ref, computed } from 'vue';

export function useArrayGroup<T>(items: T[]) {
  const groupBy = ref<string | null>(null);
  const groupedItems = ref<Record<string, T[]>>({});

  const groups = computed(() => Object.keys(groupedItems.value));
  const groupKeys = computed(() => Object.keys(groupedItems.value));

  function setGroupBy(key: string) {
    groupBy.value = key;
    applyGrouping();
  }

  function applyGrouping() {
    if (!groupBy.value) {
      groupedItems.value = { 'all': items };
      return;
    }

    const groups: Record<string, T[]> = {};

    items.forEach((item) => {
      const value = (item as any)[groupBy.value!];
      const key = String(value);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    groupedItems.value = groups;
  }

  function getGroup(key: string) {
    return groupedItems.value[key] || [];
  }

  function clearGrouping() {
    groupBy.value = null;
    groupedItems.value = { 'all': items };
  }

  return {
    groupBy,
    groupedItems,
    groups,
    groupKeys,
    setGroupBy,
    applyGrouping,
    getGroup,
    clearGrouping,
  };
}
