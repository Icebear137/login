"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/slices/reducer";
import {
  setUsername,
  setPassword,
  setSelectedSchoolId,
  loginRequest,
  logout,
} from "@/redux/slices/authSlice";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = useCallback(async () => {
    try {
      const { username, password, selectedSchoolId } = authState;

      if (!username || !password || !selectedSchoolId) {
        return false;
      }

      dispatch(
        loginRequest({
          username,
          password,
          schoolId: parseInt(selectedSchoolId),
        })
      );

      // Đây là một trường hợp đặc biệt vì Zustand trả về Promise<boolean>
      // và UI cần biết kết quả ngay lập tức
      // Vì Redux-Saga xử lý bất đồng bộ, chúng ta sẽ lắng nghe thay đổi auth state trong component
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [authState, dispatch]);

  const handleSetUsername = useCallback(
    (username: string) => {
      dispatch(setUsername(username));
    },
    [dispatch]
  );

  const handleSetPassword = useCallback(
    (password: string) => {
      dispatch(setPassword(password));
    },
    [dispatch]
  );

  const handleSetSelectedSchoolId = useCallback(
    (schoolId: string | null) => {
      dispatch(setSelectedSchoolId(schoolId));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    ...authState,
    setUsername: handleSetUsername,
    setPassword: handleSetPassword,
    setSelectedSchoolId: handleSetSelectedSchoolId,
    login,
    logout: handleLogout,
  };
};
