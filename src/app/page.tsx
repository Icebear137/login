"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/borrow-book";
    } else {
      window.location.href = "/login";
    }
  }, []);

  // Show loading state while redirecting
  return <div>Redirecting...</div>;
}
