"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Space, Spin } from "antd";
import { UserOutlined, LockOutlined, LoadingOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { UnitSelectors } from "./UnitSelectors";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Sử dụng component đơn giản để hiển thị loading thay vì dynamic import
const SimpleLoadingIndicator = ({ text = "Đang xử lý đăng nhập..." }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return (
    <div className="flex items-center justify-center py-4">
      <div className="text-center">
        <Spin indicator={antIcon} size="small" />
        <div className="mt-2">{text}</div>
      </div>
    </div>
  );
};

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const {
    setUsername,
    setPassword,
    login,
    isLoading: authLoading,
    isAuthenticated,
    error,
    selectedSchoolId,
  } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // Sử dụng useEffect để xử lý kết quả của login
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Đăng nhập thành công!");
      router.push("/user");
    }
  }, [isAuthenticated, router]);

  // Xử lý lỗi đăng nhập từ Redux
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Tự động focus vào field username khi có lỗi
      form.getFieldInstance("username")?.focus();
    }
  }, [error, form]);

  const handleLogin = async (values: LoginFormValues) => {
    if (!selectedSchoolId) {
      toast.warn("Vui lòng chọn đơn vị trước khi đăng nhập");
      return;
    }

    setLoading(true);
    try {
      setUsername(values.username);
      setPassword(values.password);
      await login();
    } finally {
      setLoading(false);
    }
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  return (
    <div className="w-full md:w-2/3 px-4 mx-auto">
      <Space direction="vertical" size="large" className="w-full">
        <Card title="THÔNG TIN ĐƠN VỊ" className={styles.loginCard}>
          <UnitSelectors onValidationChange={handleValidationChange} />
        </Card>
        <Card title="THÔNG TIN TÀI KHOẢN" className={styles.loginCard}>
          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Hãy nhập tên đăng nhập!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                autoFocus
                disabled={loading || authLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                disabled={loading || authLoading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading || authLoading}
                disabled={!isFormValid}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          {(loading || authLoading) && (
            <div className="mt-4">
              <SimpleLoadingIndicator />
            </div>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default LoginForm;
