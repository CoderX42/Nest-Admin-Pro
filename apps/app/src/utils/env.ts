let baseUrl = 'https://api.example.com/api';
let fileBaseUrl = 'https://api.example.com/file';

// #ifdef H5
baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
fileBaseUrl = (import.meta.env.VITE_FILE_BASE_URL as string) || '/file';
// #endif

export const BASE_URL = baseUrl;
export const FILE_BASE_URL = fileBaseUrl;
export const APP_VERSION = '1.0.0';
