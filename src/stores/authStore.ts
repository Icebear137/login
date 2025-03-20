import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import { message } from "antd";
import { toast } from "react-toastify";

interface AuthStoreState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  password: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
}

interface AuthStoreActions {
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setSelectedSchoolId: (schoolId: string) => void;
  login: () => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      username: "",
      password: "",
      selectedSchoolId: null,
      isLoading: false,

      setUsername: (username: string) => set({ username }),
      setPassword: (password: string) => set({ password }),
      setSelectedSchoolId: (schoolId: string) =>
        set({ selectedSchoolId: schoolId }),

      login: async (): Promise<boolean> => {
        const { username, password, selectedSchoolId } = get();

        if (!username || !password || !selectedSchoolId) {
          toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
          return false;
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
          return true;
        } catch (error) {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Đăng nhập thất bại";
          toast.error(errorMessage);
          set({ isAuthenticated: false, token: null });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: (): void => {
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
