"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMemo } from "react";

export const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  // Sử dụng useMemo để tránh re-render không cần thiết
  const toastContainer = useMemo(
    () => (
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    ),
    []
  );

  // Đảm bảo rằng cấu trúc DOM giống nhau ở cả server và client
  // bằng cách luôn sử dụng cùng một cấu trúc component
  return (
    <Provider store={store}>
      {typeof window !== "undefined" && persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          {children}
          {toastContainer}
        </PersistGate>
      ) : (
        <>
          {children}
          {toastContainer}
        </>
      )}
    </Provider>
  );
};
