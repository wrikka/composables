import { computed, ref } from "vue";

interface SearchOptions<T> {
  fields?: (keyof T)[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
  highlight?: boolean;
}

interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

export function useDataSearch<T extends Record<string, any>>(data: T[]) {
  const query = ref("");
  const results = ref<SearchResult<T>[]>([]);
  const isSearching = ref(false);

  const fuzzyMatch = (text: string, pattern: string): boolean => {
    const t = text.toLowerCase();
    const p = pattern.toLowerCase();
    let ti = 0;
    let pi = 0;

    while (ti < t.length && pi < p.length) {
      if (t[ti] === p[pi]) {
        ti++;
        pi++;
      } else {
        ti++;
      }
    }

    return pi === p.length;
  };

  const highlightText = (text: string, pattern: string): string => {
    const regex = new RegExp(`(${pattern})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const calculateScore = (text: string, pattern: string): number => {
    const t = text.toLowerCase();
    const p = pattern.toLowerCase();

    if (t === p) return 100;
    if (t.startsWith(p)) return 80;
    if (t.includes(p)) return 60;
    if (fuzzyMatch(t, p)) return 40;

    return 0;
  };

  const search = (searchQuery: string, options: SearchOptions<T> = {}) => {
    const { fields, fuzzy: _fuzzy = false, caseSensitive = false, highlight = false } = options;

    isSearching.value = true;
    query.value = searchQuery;

    if (!searchQuery.trim()) {
      results.value = [];
      isSearching.value = false;
      return;
    }

    const searchFields = fields || (Object.keys(data[0] || {}) as (keyof T)[]);
    const searchResults: SearchResult<T>[] = [];

    data.forEach((item) => {
      let maxScore = 0;
      const matches: string[] = [];

      searchFields.forEach((field) => {
        const value = String(item[field] || "");
        const text = caseSensitive ? value : value.toLowerCase();
        const pattern = caseSensitive ? searchQuery : searchQuery.toLowerCase();

        const score = calculateScore(text, pattern);

        if (score > 0) {
          if (score > maxScore) maxScore = score;
          if (highlight) {
            matches.push(highlightText(value, searchQuery));
          } else {
            matches.push(value);
          }
        }
      });

      if (maxScore > 0) {
        searchResults.push({ item, score: maxScore, matches });
      }
    });

    searchResults.sort((a, b) => b.score - a.score);
    results.value = searchResults;
    isSearching.value = false;
  };

  const clear = () => {
    query.value = "";
    results.value = [];
  };

  const hasResults = computed(() => results.value.length > 0);
  const resultCount = computed(() => results.value.length);

  return {
    query,
    results,
    isSearching,
    hasResults,
    resultCount,
    search,
    clear,
  };
}
