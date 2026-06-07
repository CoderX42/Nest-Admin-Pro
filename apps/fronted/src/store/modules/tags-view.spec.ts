import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { useTagsViewStore } from './tags-view';

describe('useTagsViewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds visited and cached views then resets', () => {
    const store = useTagsViewStore();
    const route = {
      path: '/dashboard',
      fullPath: '/dashboard',
      name: 'Dashboard',
      meta: { title: 'Dashboard', keepAlive: true },
    } as unknown as RouteLocationNormalizedLoaded;

    store.addView(route);
    store.reset();

    expect(store.visitedViews).toHaveLength(0);
    expect(store.cachedViews).toHaveLength(0);
  });
});
