import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface DictItem {
  label: string;
  value: string;
  type: string;
  cssClass?: string;
}

export const useDictStore = defineStore('dict', () => {
  const dictMap = ref<Record<string, DictItem[]>>({});
  const loadedTypes = computed(() => Object.keys(dictMap.value));

  function setDict(type: string, items: DictItem[]) {
    dictMap.value[type] = items;
  }

  function getDict(type: string) {
    return dictMap.value[type] ?? [];
  }

  function removeDict(type: string) {
    delete dictMap.value[type];
  }

  function reset() {
    dictMap.value = {};
  }

  return {
    dictMap,
    loadedTypes,
    setDict,
    getDict,
    removeDict,
    reset,
  };
});
