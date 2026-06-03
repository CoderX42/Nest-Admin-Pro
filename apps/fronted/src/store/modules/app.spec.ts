// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAppStore } from './app';

describe('useAppStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('toggles sidebar and updates device', () => {
    const store = useAppStore();

    store.toggleSidebar();
    store.setDevice('mobile');

    expect(store.sidebarCollapsed).toBe(true);
    expect(store.device).toBe('mobile');
    expect(store.isMobile).toBe(true);
  });
});
