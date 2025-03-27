"use client";

import { LoginBackground } from "../../components/login/LoginBackground";
import { LoginForm } from "../../components/login/LoginForm";
import { useEffect, useState } from "react";

export default function LoginPage() {
  // Sử dụng useState và useEffect để tránh hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chỉ render UI khi component đã được mount ở client
  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex w-full min-h-screen">
      <LoginBackground />
      <div className="w-2/3 flex justify-center items-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
