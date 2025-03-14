"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "antd";

const getUserInfo = async (token: string) => {
  try {
    const response = await axios.get(
      "https://devgwapi.thuvien.edu.vn/v1/user/get-current-user-info",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(
      "Lỗi lấy thông tin người dùng:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin người dùng!"
    );
  }
};

const UserPage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("Không tìm thấy token, chuyển hướng đến trang đăng nhập.");
      router.push("/login");
      return;
    }

    getUserInfo(token)
      .then((data) => setUserInfo(data))
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  return (
    <div>
      <h1>User Page</h1>
      <Button
        type="primary"
        danger
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
      >
        Đăng xuất
      </Button>
      {userInfo ? (
        <pre>{JSON.stringify(userInfo, null, 2)}</pre>
      ) : (
        <p>Đang tải thông tin người dùng...</p>
      )}
    </div>
  );
};

export default UserPage;
