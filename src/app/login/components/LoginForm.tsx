import { useState, useEffect, useCallback } from "react";
import { Space, Input, Button } from "antd";
import { BsTelephoneFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UnitSelectors } from "./UnitSelectors";
import { useSchoolData } from "../hooks/useSchoolData";
import { useSavedLoginPreferences } from "../hooks/useLocalStorage";
import { loginUser } from "../api/authApi";

export function LoginForm() {
  const router = useRouter();
  const {
    unitLevel,
    setUnitLevel,
    selectedSo,
    setSelectedSo,
    selectedPhong,
    setSelectedPhong,
    selectedSchool,
    setSelectedSchool,
    username,
    setUsername,
  } = useSavedLoginPreferences();

  const {
    soList,
    phong,
    schools,
    partners,
    loading,
    hasMore,
    fetchSoList,
    fetchPhongList,
    fetchSchoolList,
    fetchPartnerList,
    fetchSchoolById,
    debouncedSearch,
  } = useSchoolData();

  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Memoize API call functions
  const memoizedFetchSoList = useCallback(() => {
    fetchSoList();
  }, [fetchSoList]);

  const memoizedFetchPartnerList = useCallback(() => {
    fetchPartnerList();
  }, [fetchPartnerList]);

  const memoizedFetchPhongList = useCallback(() => {
    if (selectedSo) {
      fetchPhongList(selectedSo);
    }
  }, [selectedSo, fetchPhongList]);

  // const memoizedFetchSchoolById = useCallback(() => {
  //   if (selectedSchool) {
  //     fetchSchoolById(selectedSchool);
  //   }
  // }, [selectedSchool, fetchSchoolById]);

  const memoizedFetchSchoolList = useCallback(() => {
    if (selectedSo) {
      fetchSchoolList(selectedSo, selectedPhong, false);
    }
  }, [selectedSo, selectedPhong, fetchSchoolList]);

  // Initial data loading
  useEffect(() => {
    memoizedFetchSoList();
    memoizedFetchPartnerList();
    // memoizedFetchSchoolById();
  }, [memoizedFetchSoList, memoizedFetchPartnerList]);

  // Load dependent data when selections change
  useEffect(() => {
    memoizedFetchPhongList();
  }, [memoizedFetchPhongList]);

  useEffect(() => {
    memoizedFetchSchoolList();
  }, [memoizedFetchSchoolList]);

  const handleSoChange = (value: string) => {
    setSelectedSo(value);
    setSelectedPhong(null);
    setSelectedSchool(null);
  };

  const handlePhongChange = (value: string | null) => {
    setSelectedPhong(value);
    setSelectedSchool(null);
  };

  const handleSearch = (value: string) => {
    if (!selectedSo) return;

    if (value) {
      debouncedSearch(value, selectedSo, selectedPhong);
    } else {
      fetchSchoolList(selectedSo, selectedPhong, true);
    }
  };

  const handleLogin = async () => {
    if (!username || !password || !selectedSchool) {
      toast.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    setIsLoggingIn(true);
    try {
      await loginUser({
        userName: username,
        password,
        schoolId: parseInt(selectedSchool),
      });

      toast.success("Đăng nhập thành công");
      router.push("/user");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login flex h-full flex-2/3 items-center justify-center flex-col">
      <ToastContainer position="top-right" />
      <div className="absolute top-4 right-4 flex items-end gap-2 mb-4">
        <BsTelephoneFill className="text-white bg-[#32C36C] rounded-full h-10 w-10 p-2" />
        <div className="flex flex-col">
          <p className="text-[#32C36C] text-sm">Hỗ trợ trực tuyến</p>
          <p className="text-xl font-bold">1900 4740</p>
        </div>
      </div>
      <form className="form flex-center m-auto p-8 bg-white rounded shadow-md flex-col w-full max-w-md">
        <h1 className="text-2xl mb-4 text-center">THÔNG TIN ĐƠN VỊ</h1>
        <Space direction="vertical" size="middle" className="w-full gap-1">
          <UnitSelectors
            unitLevel={unitLevel}
            setUnitLevel={setUnitLevel}
            selectedSo={selectedSo}
            setSelectedSo={setSelectedSo}
            selectedPhong={selectedPhong}
            setSelectedPhong={setSelectedPhong}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            soList={soList}
            phong={phong}
            schools={schools}
            partners={partners}
            loading={loading || isLoggingIn}
            onSearch={handleSearch}
            onSoChange={handleSoChange}
            onPhongChange={handlePhongChange}
            hasMore={hasMore}
          />
        </Space>
        <h1 className="text-2xl mt-8 mb-4 text-center">THÔNG TIN ĐĂNG NHẬP</h1>
        <Space direction="vertical" size="middle" className="w-full">
          <Input
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || isLoggingIn}
          />
          <Input.Password
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || isLoggingIn}
          />
          <Button
            type="primary"
            block
            onClick={handleLogin}
            loading={isLoggingIn}
          >
            Đăng nhập
          </Button>
        </Space>
      </form>
      <div className="mb-4 mt-8">
        <span>Copy right @ 2023 QuangIch. All right reserved</span>
      </div>
    </div>
  );
}
