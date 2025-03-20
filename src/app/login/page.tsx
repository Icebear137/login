"use client";

import { LoginBackground } from "../../components/login/LoginBackground";
import { LoginForm } from "../../components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-screen">
      <LoginBackground />
      <div className="w-2/3 flex justify-center items-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
