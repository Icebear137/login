"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select, Space, Input, Button } from "antd";
import { useRouter } from 'next/navigation';

const take = 10; // Số trường hiển thị mỗi lần
let schoolData: any[] = []; // Lưu dữ liệu gốc

const getAllSchool = async () => {
  try {
    const response = await axios.get(
      "https://devgwapi.thuvien.edu.vn/v1/master-data/school/list"
    );
    schoolData = response.data.data.data; // Lưu dữ liệu gốc
  } catch (error) {
    console.error("Lỗi lấy danh sách trường:", error);
  }
};



const LoginPage: React.FC = () => {
  const [unitLevel, setUnitLevel] = useState<string | undefined>(undefined);
  const [selectedSo, setSelectedSo] = useState<string | null>(null);
  const [selectedPhong, setSelectedPhong] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [phong, setPhong] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [displaySchools, setDisplaySchools] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  useEffect(() => {
    getAllSchool();
  }, []);

const handleSoChange = (value: string) => {
  setSelectedSo(value);
  setSelectedPhong(null); // Reset Phòng
  setSelectedSchool(null); // Reset Trường
  setSkip(0);

  // Lọc danh sách phòng theo Sở được chọn
  const filteredPhongs = schoolData.filter(
    (s) => s.groupUnitCode === "03" && s.doetCode === value
  );
  setPhong(filteredPhongs);

  // Lọc danh sách trường theo Sở được chọn
  const filteredSchools = schoolData.filter(
    (s) => s.groupUnitCode === "04" && s.doetCode === value // Chỉ lấy trường, bỏ phòng
  );
  setSchools(filteredSchools);
  setDisplaySchools(filteredSchools.slice(0, take));
};

const handlePhongChange = (value: string) => {
  setSelectedPhong(value);
  setSelectedSchool(null); // Reset Trường
  setSkip(0);

  // Lọc danh sách trường theo Phòng được chọn (chỉ lấy groupUnitCode === "04")
  const filteredSchools = schoolData.filter(
    (s) => s.groupUnitCode === "04" && s.divisionCode === value
  );
  setSchools(filteredSchools);
  setDisplaySchools(filteredSchools.slice(0, take));
};

  const handleLogin = async () => {
    if (!username || !password || !selectedSchool) {
      console.error("Vui lòng nhập đầy đủ thông tin đăng nhập");
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

      console.log("Đăng nhập thành công:", response.data);

      const token = response.data.data.access_token;
      if (!token) {
        throw new Error("Không lấy được access_token");
      }

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.headers.common["OrgId"] = selectedSchool;

      console.log("Token đã lưu:", localStorage.getItem("token"));

      router.push("/user");
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error.response?.data || error.message);
    }
  };


  return (
    <div className="login-page h-screen flex m-auto bg-gray-100">
      <div
        className="img-info flex-1/3"
        style={{
          backgroundImage:
            'url("https://devcms.thuvien.edu.vn/images/img-bg-login.png")',
          backgroundSize: "cover",
        }}
      ></div>
      <div className="login flex h-full flex-2/3 items-center justify-center flex-col">
        <form className="form flex-center m-auto p-8 bg-white rounded shadow-md flex-col w-full max-w-md">
          <h1 className="text-2xl mb-4 text-center">THÔNG TIN ĐƠN VỊ</h1>
          <Space direction="vertical" size="middle" className="w-full">
            {/* Chọn cấp đơn vị */}
            <Select
              style={{ width: "100%" }}
              allowClear
              showSearch
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
            />
            {/* Chọn Sở và hiển thị tên của sở nằm ở các data có groupUnitCode = 02*/}
            {(unitLevel === "01" ||
              unitLevel === "02" ||
              unitLevel === "03") && (
              <Select
                style={{ width: "100%" }}
                allowClear
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
              />
            )}
            {/* Chọn Phòng và hiển thị tên của sở nằm ở các data có groupUnitCode = 03*/}
            {(unitLevel === "02" || unitLevel === "03") && (
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                value={selectedPhong}
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
                onChange={handlePhongChange}
              />
            )}
            {/* Chọn Trường */}
            {unitLevel === "03" && (
              <Select
                style={{ width: "100%" }}
                allowClear
                showSearch
                value={selectedSchool}
                onChange={setSelectedSchool}
                placeholder="Trường"
                options={schools.map((s) => ({
                  value: s.id,
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
                    {displaySchools.length < schools.length &&
                      Input.length === 0 && (
                        <Button
                          style={{ width: "100%" }}
                          onClick={handleLoadMore}
                          type="link"
                        >
                          Xem thêm...
                        </Button>
                      )}
                  </div>
                )}
              />
            )}
            {/* Đối tác lấy theo groupUnitCode = 05 */}
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
            />
            <Input.Password
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="primary" block onClick={handleLogin}>
              Đăng nhập
            </Button>
          </Space>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
