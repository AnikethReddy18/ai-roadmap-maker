export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-roadmap-maker-4blt.onrender.com';

export const apiUrl = (endpoint) => {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};
