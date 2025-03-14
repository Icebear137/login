"use client";
import { LoginBackground } from "./components/LoginBackground";
import { LoginForm } from "./components/LoginForm";

const LoginPage = () => {
  return (
    <div className="login-page h-screen flex m-auto bg-gray-100 relative">
      <LoginBackground />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
