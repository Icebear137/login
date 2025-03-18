import React from "react";
import { Form, Input, Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { UnitSelectors } from "./UnitSelectors";
import { useAuthStore } from "../../stores/authStore";
// import { set } from "lodash";

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const { setUsername, setPassword, login } = useAuthStore();

  const handleLogin = (values: LoginFormValues) => {
    setUsername(values.username);
    setPassword(values.password);
    login();
  };

  return (
    <div className={styles.container}>
      <Card title="THÔNG TIN ĐƠN VỊ" className={styles.loginCard}>
        <UnitSelectors />
      </Card>
      <Card title="THÔNG TIN TÀI KHOẢN" className={styles.loginCard}>
        <Form
          name="login"
          onFinish={handleLogin} // Pass handleLogin to onFinish
          autoComplete="off"
        >
          <Form.Item
            name="Username"
            rules={[{ required: true, message: "Hãy nhập tên đăng nhập!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
