"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Table,
  Typography,
  Tag,
  Button,
  Input,
  DatePicker,
  Form,
  Spin,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchLoanDetailById,
  clearSelectedLoan,
} from "@/redux/slices/borrowSlice";
import type { ColumnsType } from "antd/es/table";
import { LoanDetail } from "@/types/schema";
import * as XLSX from "xlsx";

const { Title } = Typography;

interface LoanDetailModalProps {
  visible: boolean;
  loanId: string | null;
  onCancel: () => void;
}

const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  visible,
  loanId,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const { selectedLoan, loading } = useSelector(
    (state: RootState) => state.borrow
  );

  useEffect(() => {
    if (visible && loanId) {
      // @ts-expect-error - API expects string but type definition expects number
      dispatch(fetchLoanDetailById(loanId));
    }

    // Clean up when modal is closed
    return () => {
      if (!visible) {
        dispatch(clearSelectedLoan());
      }
    };
  }, [visible, loanId, dispatch]);

  const generateAndDownloadExcel = () => {
    if (!selectedLoan) return;

    // Tạo dữ liệu cho file Excel
    const excelData = [
      ["SỞ GIÁO DỤC EDIT LẦN N"],
      ["TRƯỜNG THCS XUÂN LA"],
      [""],
      ["PHIẾU MƯỢN SÁCH"],
      [
        `Ngày mượn: ${new Date(selectedLoan.loanDate).toLocaleDateString(
          "vi-VN"
        )}`,
      ],
      [
        `Họ và tên người mượn: ${selectedLoan.fullName}                    Mã thẻ: ${selectedLoan.cardNumber}`,
      ],
      [
        `Nhóm/lớp: ${
          selectedLoan.schoolClassName ||
          selectedLoan.teacherGroupSubjectName ||
          ""
        }`,
      ],
      [""],
      ["STT", "Số ĐKCB", "Tên ấn phẩm", "Tên tác giả", "Ghi chú"],
      ...selectedLoan.books.map((book, index) => [
        index + 1,
        book.registrationNumber,
        book.title,
        book.authors,
        book.isLost ? "Làm mất" : book.isReturn ? "Đã trả" : "",
      ]),
      [""],
      [""],
      [""],
      [
        "                NGƯỜI MƯỢN",
        "                                    PHỤ TRÁCH THƯ VIỆN",
      ],
      [""],
      [""],
      [
        `                ${selectedLoan.fullName}`,
        `                                    ${selectedLoan.lenderName}`,
      ],
    ];

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Tùy chỉnh style cho worksheet
    ws["!merges"] = [
      { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // Merge "PHIẾU MƯỢN SÁCH"
      { s: { r: 13, c: 0 }, e: { r: 13, c: 2 } }, // Merge "NGƯỜI MƯỢN"
      { s: { r: 13, c: 3 }, e: { r: 13, c: 4 } }, // Merge "PHỤ TRÁCH THƯ VIỆN"
      { s: { r: 16, c: 0 }, e: { r: 16, c: 2 } }, // Merge tên người mượn
      { s: { r: 16, c: 3 }, e: { r: 16, c: 4 } }, // Merge tên thủ thư
    ];

    // Tùy chỉnh độ rộng cột
    ws["!cols"] = [
      { width: 5 }, // STT
      { width: 15 }, // Số ĐKCB
      { width: 40 }, // Tên ấn phẩm
      { width: 20 }, // Tên tác giả
      { width: 15 }, // Ghi chú
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Phiếu mượn");

    // Tải file về
    XLSX.writeFile(wb, `Phieu_muon_${selectedLoan.loanCode}.xlsx`);
  };

  const handleCancel = () => {
    dispatch(clearSelectedLoan());
    onCancel();
  };

  // Table columns for books
  const bookColumns: ColumnsType<LoanDetail["books"][0]> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nhan đề ấn phẩm",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Số ĐKCB",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      width: 120,
    },
    {
      title: "Tác giả",
      dataIndex: "authors",
      key: "authors",
      width: 150,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => {
        if (record.isLost) {
          return <Tag color="red">Làm mất</Tag>;
        } else if (record.isReturn) {
          return <Tag color="green">Đã trả</Tag>;
        } else {
          return <Tag color="blue">Đang mượn</Tag>;
        }
      },
    },
  ];

  return (
    <Modal
      title={<Title level={4}>Chi tiết phiếu mượn</Title>}
      open={visible}
      onCancel={handleCancel}
      width={1000}
      footer={
        <div className="flex justify-end mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Button
            onClick={handleCancel}
            className="mr-4 px-4 h-10 flex items-center"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Đóng
          </Button>
          <Button
            type="primary"
            onClick={generateAndDownloadExcel}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 px-4 h-10 flex items-center"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            }
          >
            In phiếu
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white">
          <Spin size="large" />
          <div className="mt-2 text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : selectedLoan ? (
        <div>
          {selectedLoan.books.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-red-700">
                    Số sách đang mượn
                  </div>
                  <div className="bg-red-100 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-red-600">
                  {selectedLoan.books.length}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Left column - Reader information */}
            <div className="w-full md:w-1/2 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Thông tin bạn đọc
              </h3>
              <Form layout="vertical">
                <Form.Item label="Mã thẻ" required className="mb-3">
                  <div className="flex gap-2">
                    <Input
                      value={selectedLoan.cardNumber}
                      readOnly
                      disabled
                      className="rounded-md bg-gray-50"
                    />
                    <Button
                      icon={<CopyOutlined />}
                      className="flex items-center justify-center"
                    />
                  </div>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Form.Item label="Họ và tên" className="mb-3">
                      <Input
                        value={selectedLoan.fullName}
                        readOnly
                        disabled
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item label="Lớp/Tổ bộ môn" className="mb-3">
                      <Input
                        value={
                          selectedLoan.schoolClassName ||
                          selectedLoan.teacherGroupSubjectName ||
                          "N/A"
                        }
                        readOnly
                        disabled
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item label="Trạng thái thẻ" className="mb-3">
                      <Input
                        value="Đang lưu thông"
                        readOnly
                        disabled
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item
                      label="Ngày hết hạn thẻ"
                      required
                      className="mb-3"
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabled
                        placeholder="30/05/2028"
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>

            {/* Right column - Loan information */}
            <div className="w-full md:w-1/2 bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Thông tin mượn
              </h3>
              <Form layout="vertical">
                <Form.Item label="Số đăng ký cá biệt" className="mb-3">
                  <div className="flex gap-2">
                    <Input
                      value=""
                      readOnly
                      disabled
                      className="rounded-md bg-gray-50"
                    />
                    <Button
                      icon={<CopyOutlined />}
                      className="flex items-center justify-center"
                    />
                  </div>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Form.Item label="Số phiếu mượn" required className="mb-3">
                      <Input
                        value={selectedLoan.loanCode}
                        readOnly
                        disabled
                        prefix={<span className="text-gray-400 mr-1">#</span>}
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item
                      label="Cán bộ thư viện"
                      required
                      className="mb-3"
                    >
                      <Input
                        value={selectedLoan.lenderName}
                        readOnly
                        disabled
                        prefix={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item label="Ngày Mượn" required className="mb-3">
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabled
                        placeholder={
                          selectedLoan.loanDate
                            ? new Date(
                                selectedLoan.loanDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"
                        }
                        suffixIcon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>

                  <div>
                    <Form.Item label="Ghi chú" className="mb-3">
                      <Input
                        value={selectedLoan.note || ""}
                        readOnly
                        disabled
                        className="rounded-md bg-gray-50"
                      />
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
            <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Danh sách tài liệu
            </h3>
            <Table
              columns={bookColumns}
              dataSource={selectedLoan.books.map((book, index) => ({
                ...book,
                key: `book-${book.id}-${index}`,
              }))}
              pagination={false}
              size="middle"
              className="border border-gray-200 rounded-md overflow-hidden"
              rowClassName="hover:bg-blue-50"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="text-gray-500 text-lg">
            Không tìm thấy thông tin phiếu mượn
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LoanDetailModal;
