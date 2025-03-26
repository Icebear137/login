"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, Card, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { UnitSelectors } from "./UnitSelectors";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setUsername,
  setPassword,
  loginRequest,
} from "@/redux/slices/authSlice";

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, selectedSchoolId } = useAppSelector(
    (state) => state.auth
  );
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/user");
    }
  }, [isAuthenticated, router]);

  const handleLogin = (values: LoginFormValues) => {
    if (!selectedSchoolId) {
      toast.warn("Vui lòng chọn đơn vị trước khi đăng nhập");
      return;
    }

    // Đặt thông tin đăng nhập vào state
    dispatch(setUsername(values.username));
    dispatch(setPassword(values.password));

    // Kích hoạt saga
    dispatch(loginRequest());
  };

  return (
    <div className="w-2/3">
      <Space direction="vertical" size="large" className="w-full">
        <Card title="THÔNG TIN ĐƠN VỊ" className={styles.loginCard}>
          <UnitSelectors />
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
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default LoginForm;
