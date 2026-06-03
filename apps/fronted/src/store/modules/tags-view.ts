import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

export interface VisitedView {
  path: string;
  name?: string;
  title?: string;
  fullPath: string;
}

function fromRoute(route: RouteLocationNormalizedLoaded): VisitedView {
  return {
    path: route.path,
    name: route.name ? String(route.name) : undefined,
    title: typeof route.meta.title === 'string' ? route.meta.title : undefined,
    fullPath: route.fullPath,
  };
}

export const useTagsViewStore = defineStore('tags-view', () => {
  const visitedViews = ref<VisitedView[]>([]);
  const cachedViews = ref<string[]>([]);

  function addView(route: RouteLocationNormalizedLoaded) {
    addVisitedView(route);
    addCachedView(route);
  }

  function addVisitedView(route: RouteLocationNormalizedLoaded) {
    if (visitedViews.value.some((view) => view.path === route.path)) {
      return;
    }
    visitedViews.value.push(fromRoute(route));
  }

  function addCachedView(route: RouteLocationNormalizedLoaded) {
    if (!route.name || route.meta.keepAlive !== true) {
      return;
    }
    const name = String(route.name);
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name);
    }
  }

  function removeView(path: string) {
    visitedViews.value = visitedViews.value.filter((view) => view.path !== path);
  }

  function reset() {
    visitedViews.value = [];
    cachedViews.value = [];
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    addCachedView,
    removeView,
    reset,
  };
});
