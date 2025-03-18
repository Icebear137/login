import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthState } from "../types/schema";
import { authService } from "../services/authService";
import { message } from "antd";
import { redirect } from "next/navigation";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      username: "",
      password: "",
      selectedSchoolId: null,
      isLoading: false,

      setUsername: (username) => set({ username }),
      setPassword: (password) => set({ password }),
      setSelectedSchoolId: (schoolId) => set({ selectedSchoolId: schoolId }),

      login: async () => {
        const { username, password, selectedSchoolId } = get();

        if (!username || !password || !selectedSchoolId) {
          message.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
          return;
        }

        set({ isLoading: true });

        try {
          const token = await authService.login({
            userName: username,
            password,
            schoolId: parseInt(selectedSchoolId),
          });

          set({
            isAuthenticated: true,
            token,
            password: "", // Clear password from store
          });

          message.success("Đăng nhập thành công");
          console.log(username, password, selectedSchoolId);
          redirect("/user");
        } catch (error) {
          set({ isAuthenticated: false, token: null });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          token: null,
          password: "",
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        username: state.username,
        selectedSchoolId: state.selectedSchoolId,
      }),
    }
  )
);
