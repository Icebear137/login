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
import createSagaMiddleware from "redux-saga";
import authReducer from "./slices/authSlice";
import schoolReducer from "./slices/schoolSlice";
import borrowReducer from "./slices/borrowSlice";
import studentReducer from "./slices/studentSlice";
import bookReducer from "./slices/bookSlice";
import rootSaga from "./sagas";

// Kiểm tra xem có đang ở môi trường client không để tránh lỗi khi chạy trên server
const isClient = typeof window !== "undefined";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "school", "student"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
  borrow: borrowReducer,
  student: studentReducer,
  book: bookReducer,
});

// Chỉ sử dụng persist khi ở môi trường client
const persistedReducer = isClient
  ? persistReducer(persistConfig, rootReducer)
  : rootReducer;

// Tạo saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware),
});

// Chạy saga
if (isClient) {
  sagaMiddleware.run(rootSaga);
}

export const persistor = isClient ? persistStore(store) : null;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
