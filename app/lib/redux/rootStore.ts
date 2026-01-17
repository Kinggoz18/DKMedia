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
function getStorage() {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    // Client-side: return localStorage-based storage
    // Create storage that matches the redux-persist interface
    const ls = window.localStorage;
    return {
      getItem: (key: string) => {
        try {
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
  // Server-side: use noop storage
  return createNoopStorage();
}

const storage = getStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['newsletter', 'user']
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
