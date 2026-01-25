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

// Noop storage for SSR
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

// Safari Private Mode can have localStorage but throw on access, causing hydration stalls
// Test before using to avoid blocking
function getStorage() {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    const ls = window.localStorage;
    return {
      getItem: (key: string) => {
        try {
          // Test access first - Safari Private Mode throws even if localStorage exists
          const testKey = '__storage_test__';
          ls.setItem(testKey, testKey);
          ls.removeItem(testKey);
          return Promise.resolve(ls.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          ls.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          ls.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }
  return createNoopStorage();
}

const storage = getStorage();

const persistConfig = {
  key: 'root',
  storage,
  // Newsletter removed - non-critical UX state shouldn't block hydration (Safari Private Mode issue)
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
