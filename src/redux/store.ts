"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import schoolReducer from "./slices/schoolSlice";

// Kiểm tra xem có đang ở môi trường client không để tránh lỗi khi chạy trên server
const isClient = typeof window !== "undefined";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "school"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
});

// Chỉ sử dụng persist khi ở môi trường client
const persistedReducer = isClient
  ? persistReducer(persistConfig, rootReducer)
  : rootReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = isClient ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
