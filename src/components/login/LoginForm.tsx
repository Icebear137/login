import React from "react";
import { Form, Input, Button, Card, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { UnitSelectors } from "./UnitSelectors";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { setUsername, setPassword, login, isLoading } = useAuthStore();

  const handleLogin = async (values: LoginFormValues) => {
    setUsername(values.username);
    setPassword(values.password);
    const success = await login();
    if (success) {
      router.push("/user");
    }
  };

  return (
    <div className="w-2/3">
      <Space direction="vertical" size="large" className="w-full">
        <Card title="THÔNG TIN ĐƠN VỊ" className={styles.loginCard}>
          <UnitSelectors />
        </Card>
        <Card title="THÔNG TIN TÀI KHOẢN" className={styles.loginCard}>
          <Form name="login" onFinish={handleLogin} autoComplete="off">
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Hãy nhập tên đăng nhập!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
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
