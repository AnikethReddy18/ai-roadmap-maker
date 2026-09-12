import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Adjust default host for Android Emulator vs Localhost
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
export const API_BASE_URL = DEFAULT_HOST;

const TOKEN_STORAGE_KEY = 'auth_token';

export async function getAuthToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
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

export async function apiFetch(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}
