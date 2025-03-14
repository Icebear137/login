"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select, Space, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BsTelephoneFill } from "react-icons/bs";

const take = 10; // Number of items to display per load

interface School {
  id: number;
  name: string;
  groupUnitCode: string;
  doetCode?: string;
  divisionCode?: string;
  schoolCode?: string;
}

const LoginPage: React.FC = () => {
  const [unitLevel, setUnitLevel] = useState<string | undefined>(undefined);
  const [selectedSo, setSelectedSo] = useState<string | null>(null);
  const [selectedPhong, setSelectedPhong] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [phong, setPhong] = useState<School[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [displaySchools, setDisplaySchools] = useState<School[]>([]);
  const [skip, setSkip] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [schoolData, setSchoolData] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedUnitLevel = localStorage.getItem("unitLevel");
    const savedSelectedSo = localStorage.getItem("selectedSo");
    const savedSelectedPhong = localStorage.getItem("selectedPhong");
    const savedSelectedSchool = localStorage.getItem("selectedSchool");
    const savedUsername = localStorage.getItem("username");

    if (savedUnitLevel) setUnitLevel(savedUnitLevel);
    if (savedSelectedSo) setSelectedSo(savedSelectedSo);
    if (savedSelectedPhong) setSelectedPhong(savedSelectedPhong);
    if (savedSelectedSchool) setSelectedSchool(savedSelectedSchool);
    if (savedUsername) setUsername(savedUsername);

    getAllSchool();
  }, []);

  // Save unitLevel to localStorage whenever it changes
  useEffect(() => {
    if (unitLevel !== undefined) {
      localStorage.setItem("unitLevel", unitLevel);
    }
  }, [unitLevel]);

  // Save selectedSo to localStorage whenever it changes
  useEffect(() => {
    if (selectedSo !== null) {
      localStorage.setItem("selectedSo", selectedSo);
    }
  }, [selectedSo]);

  // Save selectedPhong to localStorage whenever it changes
  useEffect(() => {
    if (selectedPhong !== null) {
      localStorage.setItem("selectedPhong", selectedPhong);
    }
  }, [selectedPhong]);

  // Save selectedSchool to localStorage whenever it changes
  useEffect(() => {
    if (selectedSchool !== null) {
      localStorage.setItem("selectedSchool", selectedSchool);
    }
  }, [selectedSchool]);

  // Save username to localStorage whenever it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username);
    }
  }, [username]);

  // Update schools when selectedSo or selectedPhong changes
  useEffect(() => {
    if (selectedSo) {
      let filteredSchools = schoolData.filter(
        (s) => s.groupUnitCode === "04" && s.doetCode === selectedSo
      );

      if (selectedPhong) {
        filteredSchools = filteredSchools.filter(
          (s) => s.divisionCode === selectedPhong
        );
      }

      setSchools(filteredSchools);
      setDisplaySchools(filteredSchools.slice(0, take));
    }
  }, [selectedSo, selectedPhong, schoolData]);

  const getAllSchool = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://devgwapi.thuvien.edu.vn/v1/master-data/school/list"
      );
      setSchoolData(response.data.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách trường:", error);
      message.error("Không thể tải danh sách trường. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSoChange = (value: string) => {
    setSelectedSo(value);
    setSelectedPhong(null);
    setSelectedSchool(null);
    setSkip(0);

    // Filter phòng based on the selected Sở
    const filteredPhongs = schoolData.filter(
      (s) => s.groupUnitCode === "03" && s.doetCode === value
    );
    setPhong(filteredPhongs);
  };

  const handlePhongChange = (value: string | null) => {
    setSelectedPhong(value);
    setSelectedSchool(null);
    setSkip(0);
  };

  const handleLoadMore = () => {
    const nextSkip = skip + take;
    const nextBatch = schools.slice(nextSkip, nextSkip + take);
    setDisplaySchools([...displaySchools, ...nextBatch]);
    setSkip(nextSkip);
  };

  const handleLogin = async () => {
    if (!username || !password || !selectedSchool) {
      message.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }

    try {
      const response = await axios.post(
        "https://devgwapi.thuvien.edu.vn/v1/user/login-school",
        {
          userName: username,
          password,
          schoolId: parseInt(selectedSchool),
        }
      );

      const token = response.data.data.access_token;
      if (!token) {
        throw new Error("Không lấy được access_token");
      }

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.headers.common["OrgId"] = selectedSchool;

      message.success("Đăng nhập thành công");
      router.push("/user");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Lỗi đăng nhập:", error.response?.data || error.message);
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      } else {
        console.error("Lỗi đăng nhập:", (error as Error).message);
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };

  return (
    <div className="login-page h-screen flex m-auto bg-gray-100 relative">
      <div
        className="img-info flex-1/3 p-[30px]"
        style={{
          backgroundImage:
            'url("https://devcms.thuvien.edu.vn/images/img-bg-login.png")',
          backgroundSize: "cover",
        }}
      >
        <div className="flex flex-col h-full p-[50px] gap-[20px]">
          <div className="flex items-center gap-2">
            <Image
              src="https://devcms.thuvien.edu.vn/images/img-library.svg"
              width={70}
              height={70}
              alt="Logo"
              className="bg-white p-2 rounded"
            />
            <span className="text-white">eNetLibrary</span>
          </div>

          <div className="mt-8 flex flex-wrap">
            <p className="text-white text-4xl font-bold mb-4">Hệ thống</p>
            <span className="text-[#32C36C] text-4xl font-bold mb-4 ml-[10px]">
              Thư viện điện tử{" "}
            </span>
            <p className="text-white text-4xl font-bold mb-4">trường học</p>
          </div>
          <div>
            <p className="text-white text-lg">
              Quản lý các tài liệu, bài giảng, hoạt động, hình ảnh của trường
              thông qua các tài liệu dạng Video, hình ảnh, audio, e-Learning.
              Quản lý mượn sách từ hệ thống quản lý thư viện truyền thống
            </p>
          </div>
          <div className="pt-[20px]">
            <Image
              src="https://devcms.thuvien.edu.vn/images/img-login-slide-1.svg"
              width={400}
              height={400}
              alt="Logo"
            />
          </div>
        </div>
      </div>
      <div className="login flex h-full flex-2/3 items-center justify-center flex-col">
        <div className="absolute top-4 right-4 flex items-end gap-2 mb-4">
          <BsTelephoneFill className="text-white bg-[#32C36C] rounded-full h-[40px] w-[40px] p-2" />
          <div className="flex flex-col">
            <p className="text-[#32C36C] text-[14px]">Hỗ trợ trực tuyến</p>
            <p className="text-[20px] font-bold">1900 4740</p>
          </div>
        </div>
        <form className="form flex-center m-auto p-8 bg-white rounded shadow-md flex-col w-full max-w-md">
          <h1 className="text-2xl mb-4 text-center">THÔNG TIN ĐƠN VỊ</h1>
          <Space direction="vertical" size="middle" className="w-full">
            <Select
              style={{ width: "100%" }}
              allowClear
              showSearch
              value={unitLevel}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                { value: "01", label: "Sở (01)" },
                { value: "02", label: "Phòng (02)" },
                { value: "03", label: "Trường (03)" },
                { value: "04", label: "Đơn vị đối tác (04)" },
              ]}
              placeholder="Cấp đơn vị"
              onChange={setUnitLevel}
              disabled={loading}
            />
            {(unitLevel === "01" ||
              unitLevel === "02" ||
              unitLevel === "03") && (
              <Select
                style={{ width: "100%" }}
                allowClear
                value={selectedSo}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Sở"
                options={schoolData
                  .filter((s) => s.groupUnitCode === "02")
                  .map((s) => ({
                    value: s.doetCode,
                    label: s.name,
                  }))}
                onChange={handleSoChange}
                disabled={loading}
              />
            )}
            {/* Phòng Select */}
            {(unitLevel === "02" || unitLevel === "03") && (
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                value={
                  selectedPhong
                    ? phong.find((p) => p.divisionCode === selectedPhong)?.name
                    : undefined
                }
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Phòng"
                options={phong.map((s) => ({
                  value: s.divisionCode,
                  label: s.name,
                }))}
                onChange={(value) => handlePhongChange(value)}
                disabled={loading || !selectedSo} // Disable if loading or no Sở selected
              />
            )}

            {/* Trường Select */}
            {unitLevel === "03" && (
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                value={
                  selectedSchool
                    ? schools.find((s) => s.id === parseInt(selectedSchool))
                        ?.name
                    : undefined
                }
                onChange={setSelectedSchool}
                placeholder="Trường"
                options={schools.map((s) => ({
                  value: s.id.toString(),
                  label: s.name,
                }))}
                filterOption={(input, option) => {
                  return (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase());
                }}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    {displaySchools.length < schools.length && (
                      <Button
                        style={{ width: "100%" }}
                        onClick={handleLoadMore}
                        type="link"
                        disabled={displaySchools.length >= schools.length}
                      >
                        Xem thêm...
                      </Button>
                    )}
                  </div>
                )}
                disabled={loading || !selectedSo} // Disable if loading or no Sở selected
              />
            )}
            {unitLevel === "04" && (
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder="Đơn vị đối tác"
                options={schoolData
                  .filter((s) => s.groupUnitCode === "05")
                  .map((s) => ({
                    value: s.schoolCode,
                    label: s.name,
                  }))}
                disabled={loading}
              />
            )}
          </Space>
          <h1 className="text-2xl mt-8 mb-4 text-center">
            THÔNG TIN ĐĂNG NHẬP
          </h1>
          <Space direction="vertical" size="middle" className="w-full">
            <Input
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <Input.Password
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="primary"
              block
              onClick={handleLogin}
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Space>
        </form>
        <div className="mb-4 mt-8">
          <span>Copy right @ 2023 QuangIch. All right reserved</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
