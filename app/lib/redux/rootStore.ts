import { combineReducers, configureStore } from "@reduxjs/toolkit";
import newsletterReducer from "./NewsletterSlice";
import userReducer from "./Auth/AuthSlice";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Create a noop storage for server-side rendering
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, _value: any) {
      return Promise.resolve();
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Get storage - use localStorage on client, noop on server
// Safari-safe: Treats localStorage as conditionally usable, not just conditionally present
// Safari Private Mode can have localStorage present but throw on access, causing hydration stalls
function getStorage() {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    // Client-side: return localStorage-based storage with Safari Private Mode protection
    // Create storage that matches the redux-persist interface
    const ls = window.localStorage;
    return {
      getItem: (key: string) => {
        try {
          // Test localStorage access - Safari Private Mode may throw even if localStorage exists
          const testKey = '__storage_test__';
          ls.setItem(testKey, testKey);
          ls.removeItem(testKey);
          // If test passes, localStorage is usable
          return Promise.resolve(ls.getItem(key));
        } catch {
          // Safari Private Mode or other storage restrictions - return null to prevent blocking
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          ls.setItem(key, value);
          return Promise.resolve();
        } catch {
          // Silently fail - never block on storage write failures
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          ls.removeItem(key);
          return Promise.resolve();
        } catch {
          // Silently fail - never block on storage removal
          return Promise.resolve();
        }
      },
    };
  }
  // Server-side: use noop storage
  return createNoopStorage();
}

const storage = getStorage();

const persistConfig = {
  key: 'root',
  storage,
  // Removed 'newsletter' from whitelist to prevent Safari Private Mode hydration stall
  // Newsletter state is non-critical UX and must not block app hydration
  // Safari Private Mode silently stalls on localStorage access during redux-persist rehydration
  whitelist: ['user']
}

const rootReducer = combineReducers({
  newsletter: newsletterReducer,
  user: userReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () => {
  let store: any = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        }
      }),
  })
  store.__persistor = persistStore(store)
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type IRootState = ReturnType<AppStore['getState']>
export type RootStateDispatch = AppStore['dispatch']
