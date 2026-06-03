// #ifdef H5
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
export const FILE_BASE_URL = (import.meta.env.VITE_FILE_BASE_URL as string) || '/file';
// #endif

// #ifndef H5
export const BASE_URL = 'https://api.example.com/api';
export const FILE_BASE_URL = 'https://api.example.com/file';
// #endif

export const APP_VERSION = '1.0.0';
