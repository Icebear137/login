"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spin, message } from "antd";
import { UserInfo } from "@/types/user";
import { getUserInfo } from "@/services/userService";
import { useAppDispatch } from "@/redux/hooks";
import { logoutRequest } from "@/redux/sagas/authSaga";

const UserPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        message.warning("Vui lòng đăng nhập để tiếp tục");
        router.push("/login");
        return;
      }

      try {
        const data = await getUserInfo(token);
        setUserInfo(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        message.error("Không thể lấy thông tin người dùng");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [router, isMounted]);

  const handleLogout = () => {
    dispatch(logoutRequest());
    router.push("/login");
  };

  // Tránh render ở phía server để ngăn hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Button onClick={() => router.push("/borrow-book")}>Mượn sách</Button>
      <Card
        title="Thông tin người dùng"
        extra={
          <Button type="primary" danger onClick={handleLogout}>
            Đăng xuất
          </Button>
        }
      >
        {userInfo && (
          <pre style={{ background: "#f5f5f5", padding: "15px" }}>
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        )}
      </Card>
    </div>
  );
};

export default UserPage;
