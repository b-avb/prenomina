import { computed, ref, type Ref } from 'vue';

/** Field extractors configuring case-insensitive text search and optional category filtering. */
export interface SearchFilterOptions<T> {
  textFields: (item: T) => string[];
  categoryField?: (item: T) => string;
  allCategoriesValue?: string;
}

/** Provides reactive text query and category state with a computed filtered subset of `items`. */
export function useSearchFilter<T>(
  items: Ref<T[]>,
  options: SearchFilterOptions<T>,
) {
  const allValue = options.allCategoriesValue ?? 'Todas';
  const searchQuery = ref<string>('');
  const activeCategory = ref<string>(allValue);

  const filteredItems = computed<T[]>(() => {
    const query = searchQuery.value.trim().toLowerCase();
    return items.value.filter((item) => {
      const matchesCategory =
        !options.categoryField ||
        activeCategory.value === allValue ||
        options.categoryField(item) === activeCategory.value;

      if (!matchesCategory) return false;
      if (!query) return true;

      const texts = options.textFields(item);
      return texts.some((text) => (text ?? '').toLowerCase().includes(query));
    });
  });

  function resetFilters(): void {
    searchQuery.value = '';
    activeCategory.value = allValue;
  }

  return {
    searchQuery,
    activeCategory,
    filteredItems,
    resetFilters,
  };
}
