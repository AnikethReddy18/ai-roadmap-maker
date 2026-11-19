import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PRODUCTION_API_URL = 'https://ai-roadmap-maker-4blt.onrender.com';

const getHost = () => {
  // 1. Explicitly configured via .env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 2. Automatically infer laptop/workstation LAN IP from Expo Metro bundler
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.experienceUrl;
  if (hostUri) {
    const rawHost = hostUri.replace(/^[a-zA-Z]+:\/\//, '');
    const ip = rawHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // 3. Fallback to live permanent Render backend
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getHost();

const TOKEN_STORAGE_KEY = 'auth_token';

export async function getAuthToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token) {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('AsyncStorage error:', e);
  }
}

export async function removeAuthToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('AsyncStorage remove error:', e);
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure endpoint is normalized to have /api prefix if missing (except health)
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!cleanEndpoint.startsWith('/api/') && cleanEndpoint !== '/health' && !cleanEndpoint.startsWith('/api')) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }

  const url = `${API_BASE_URL}${cleanEndpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 120)}`);
      }
      throw new Error('Received unexpected non-JSON response from server.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Server error');
    }

    return data;
  } catch (err) {
    console.error(`[API Connection Failure] Endpoint: ${url}`, err);
    if (err.message && !err.message.includes('Network request failed') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    throw new Error(`Cannot reach backend at ${API_BASE_URL}.\nMake sure your server is running on port 5000 and your phone/emulator can reach it.`);
  }
}
