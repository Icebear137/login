"use client";

import { ReactNode } from "react";
import { Providers } from "../redux/providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";

// Sử dụng dynamic import cho ErrorBoundary
const ErrorBoundary = dynamic(
  () => import("../components/common/ErrorBoundary")
);

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <Providers>
        {children}
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
        />
      </Providers>
    </ErrorBoundary>
  );
}
