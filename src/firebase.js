import { initializeApp } from 'firebase/app';
import { getDatabase as getRealDatabase, ref as realRef, set as realSet, get as realGet, onValue as realOnValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL',
};

const isPlaceholderValue = (value) => typeof value === 'string' && value.startsWith('YOUR_');
const hasValidConfig = !Object.values(firebaseConfig).some(isPlaceholderValue);

const STORAGE_KEY = 'focus-warden-firebase-fallback';
const listenerRegistry = new Map();

const readLocalState = () => {
  const rawState = localStorage.getItem(STORAGE_KEY);
  return rawState ? JSON.parse(rawState) : {};
};

const writeLocalState = (nextState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  listenerRegistry.forEach((listeners, path) => {
    const value = path.split('/').reduce((accumulator, key) => accumulator?.[key], nextState);
    const snapshot = {
      exists: () => value !== undefined,
      val: () => value,
    };
    listeners.forEach((listener) => listener(snapshot));
  });
};

const localRef = (_database, path) => path;

const localSet = async (path, value) => {
  const nextState = readLocalState();
  const pathParts = path.split('/').filter(Boolean);
  let cursor = nextState;

  for (let index = 0; index < pathParts.length - 1; index += 1) {
    const key = pathParts[index];
    if (!cursor[key] || typeof cursor[key] !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[pathParts[pathParts.length - 1]] = value;
  writeLocalState(nextState);
};

const localGet = async (path) => {
  const state = readLocalState();
  const value = path.split('/').filter(Boolean).reduce((accumulator, key) => accumulator?.[key], state);

  return {
    exists: () => value !== undefined,
    val: () => value,
  };
};

const localOnValue = (path, callback) => {
  const listeners = listenerRegistry.get(path) || new Set();
  listeners.add(callback);
  listenerRegistry.set(path, listeners);

  localGet(path).then(callback);

  const storageListener = (event) => {
    if (event.key === STORAGE_KEY) {
      localGet(path).then(callback);
    }
  };

  window.addEventListener('storage', storageListener);

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      listenerRegistry.delete(path);
    }
    window.removeEventListener('storage', storageListener);
  };
};

let database = null;
let ref = localRef;
let set = localSet;
let get = localGet;
let onValue = localOnValue;

if (hasValidConfig) {
  try {
    const app = initializeApp(firebaseConfig);
    database = getRealDatabase(app);
    ref = realRef;
    set = realSet;
    get = realGet;
    onValue = realOnValue;
  } catch (error) {
    console.warn('Firebase initialization failed, using local fallback storage.', error);
  }
}

export { database, ref, set, get, onValue, hasValidConfig };
