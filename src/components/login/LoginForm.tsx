import React from "react";
import { Form, Input, Button, Card, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styles from "./LoginForm.module.css";
import { UnitSelectors } from "./UnitSelectors";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { setUsername, setPassword, login } = useAuthStore();
  const [form] = Form.useForm();
  const [isSchoolValid, setIsSchoolValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    if (!isSchoolValid) {
      toast.error("Vui lòng chọn trường!");
      return;
    }

    setLoading(true);
    try {
      setUsername(values.username);
      setPassword(values.password);
      const success = await login();
      if (success) {
        toast.success("Đăng nhập thành công!");
        router.push("/user");
      } else {
        toast.error("Đăng nhập thất bại!");
        console.log(success);
      }
    } catch (error: any) {
      if (error.response?.data.status === 400) {
        toast.error("Sai tên đăng nhập hoặc mật khẩu!");
      } else {
        toast.error("Có lỗi xảy ra khi đăng nhập!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-2/3">
      <Space direction="vertical" size="large" className="w-full">
        <Card title="THÔNG TIN ĐƠN VỊ" className={styles.loginCard}>
          <UnitSelectors onValidationChange={setIsSchoolValid} />
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
              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </Card>
      </Space>
    </div>
  );
};

export default LoginForm;
