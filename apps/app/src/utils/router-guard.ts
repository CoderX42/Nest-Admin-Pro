const WHITE_LIST = ['/pages/login/index', '/pages/agreement/privacy', '/pages/agreement/terms'];
const METHODS = ['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'] as const;

function hasToken() {
  return Boolean(uni.getStorageSync('nap_token') || uni.getStorageSync('token'));
}

function normalizePath(url = '') {
  return url.split('?')[0];
}

function intercept(method: (typeof METHODS)[number]) {
  uni.addInterceptor(method, {
    invoke(args) {
      const path = normalizePath(args.url);
      if (WHITE_LIST.includes(path) || hasToken()) {
        return args;
      }

      uni.reLaunch({ url: '/pages/login/index' });
      return false;
    },
  });
}

export function setupRouterGuard() {
  METHODS.forEach(intercept);
}

export function redirectToLoginIfNeeded() {
  if (!hasToken()) {
    uni.reLaunch({ url: '/pages/login/index' });
  }
}
