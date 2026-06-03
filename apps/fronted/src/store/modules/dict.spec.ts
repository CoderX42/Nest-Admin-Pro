import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDictStore } from './dict';

describe('useDictStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('sets, reads and removes dict items', () => {
    const store = useDictStore();

    store.setDict('status', [{ type: 'status', label: 'Enabled', value: '1' }]);
    store.removeDict('status');

    expect(store.getDict('status')).toEqual([]);
  });
});
