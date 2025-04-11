"use client";

import React, { useState, useEffect } from "react";
import { Modal, Input, Select, Table, Button, Spin, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchStudents,
  updateFilters,
  updatePagination,
  fetchGradeCodes,
  fetchSchoolClasses,
  fetchTeacherGroupSubjects,
} from "@/redux/slices/studentSlice";
import { Student } from "@/types/schema";
import dayjs from "dayjs";

interface ReaderSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (cardNumber: string) => void;
}

interface ReaderInfo {
  cardId: string;
  name: string;
  cardType: string;
  class: string;
  expiryDate: string;
  status: string;
  totalBorrowedBooks: number;
  totalBorrowingBooks: number;
  totalReturnBooks: number;
}

// Helper function to convert Student to ReaderInfo
const studentToReaderInfo = (student: Student): ReaderInfo => {
  // Determine card type name based on cardTypeId
  let cardTypeName = "";
  if (student.cardTypeId === 1) {
    cardTypeName = "Học sinh";
  } else if (student.cardTypeId === 2) {
    cardTypeName = "Giáo viên";
  } else {
    cardTypeName = "Khác";
  }

  return {
    cardId: student.cardNumber,
    name: student.fullName,
    cardType: cardTypeName,
    class: student.schoolClassName || student.teacherGroupSubjectName || "N/A",
    expiryDate: dayjs(student.expireDate).format("DD/MM/YYYY"),
    status:
      student.cardStatus === 1
        ? "Đang lưu thông"
        : student.cardStatus === 2
        ? "Chờ kích hoạt"
        : student.cardStatus === 3
        ? "Cấm mượn"
        : "Khác",
    totalBorrowedBooks: student.totalBorrowedBooks,
    totalBorrowingBooks: student.totalBorrowingBooks,
    totalReturnBooks: student.totalReturnBooks,
  };
};

const { Option } = Select;

const ReaderSelectionModal: React.FC<ReaderSelectionModalProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const dispatch = useDispatch();
  const {
    students,
    loading,
    pagination,
    gradeCodes,
    schoolClasses,
    teacherGroupSubjects,
    loadingGradeCodes,
    loadingSchoolClasses,
    loadingTeacherGroupSubjects,
  } = useSelector((state: RootState) => state.student);

  const [searchText, setSearchText] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardTypeFilter, setCardTypeFilter] = useState<number | null>(null);
  const [cardStatusFilter, setCardStatusFilter] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expiryFilter, setExpiryFilter] = useState<string | null>(null);
  const [selectedGradeCode, setSelectedGradeCode] = useState<string | null>(
    null
  );

  // Fetch students, grade codes, and teacher group subjects when the modal is opened
  useEffect(() => {
    if (visible) {
      dispatch(fetchStudents({ page: 1, pageSize: pagination.pageSize }));
      dispatch(fetchGradeCodes());
      dispatch(fetchTeacherGroupSubjects());
    }
  }, [visible, dispatch, pagination.pageSize]);

  // Apply filters when they change
  useEffect(() => {
    if (visible) {
      dispatch(
        updateFilters({
          searchKey: searchText,
          cardTypeId: cardTypeFilter,
          cardStatus: cardStatusFilter,
          // isNotExpired được cập nhật riêng trong handleExpiryChange
        })
      );
      dispatch(fetchStudents({ page: 1 }));
    }
  }, [dispatch, visible, searchText, cardTypeFilter, cardStatusFilter]);

  // Convert students to ReaderInfo format
  const readers: ReaderInfo[] = students
    ? students.map(studentToReaderInfo)
    : [];

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Search is handled by the useEffect above
  };

  const handleCardTypeChange = (value: string) => {
    // reset filters
    setSelectedGradeCode(null);
    dispatch(updateFilters({ gradeCode: null, schoolClassId: null }));
    if (value === "all") {
      setCardTypeFilter(null);
    } else if (value === "teacher") {
      setCardTypeFilter(1); // 1 is for teachers
    } else if (value === "student") {
      setCardTypeFilter(2); // 2 is for students
    }
  };

  const handleCardStatusChange = (value: string) => {
    if (value === "all") {
      setCardStatusFilter(null);
    } else if (value === "active") {
      setCardStatusFilter(1); // 1 - Đang lưu thông
    } else if (value === "waiting") {
      setCardStatusFilter(2); // 2 - Chờ kích hoạt
    } else if (value === "banned") {
      setCardStatusFilter(3); // 3 - Cấm mượn
    } else if (value === "other") {
      setCardStatusFilter(4); // 4 - Khác
    }
  };

  const handleExpiryChange = (value: string) => {
    setExpiryFilter(value);
    if (value === "valid") {
      dispatch(updateFilters({ isNotExpired: 1 }));
    } else if (value === "expired") {
      dispatch(updateFilters({ isNotExpired: 0 }));
    } else {
      dispatch(updateFilters({ isNotExpired: null }));
    }
    // Gọi fetchStudents để áp dụng bộ lọc mới
    dispatch(fetchStudents({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(updatePagination({ current: page }));
    dispatch(fetchStudents({ page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    dispatch(updatePagination({ pageSize, current: 1 }));
    dispatch(fetchStudents({ page: 1, pageSize }));
  };

  const handleSelect = (record: ReaderInfo) => {
    onSelect(record.cardId);
    onCancel();
  };

  const handleSearchCardNumber = (value: string) => {
    setCardNumber(value);
    dispatch(updateFilters({ cardNumber: value }));
    dispatch(fetchStudents({ page: 1 }));
  };

  const columns: ColumnsType<ReaderInfo> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
      className: "",
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          className="hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleSelect(record)}
          disabled={record.status !== "Đang lưu thông"}
        >
          Chọn
        </Button>
      ),
      className: "",
    },
    {
      title: "Mã thẻ thư viện",
      dataIndex: "cardId",
      key: "cardId",
      className: "",
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      className: "",
    },
    {
      title: "Loại thẻ",
      dataIndex: "cardType",
      key: "cardType",
      className: "",
    },
    {
      title: "Lớp/Tổ bộ môn",
      dataIndex: "class",
      key: "class",
      className: "",
    },
    {
      title: "Hạn sử dụng tới",
      dataIndex: "expiryDate",
      key: "expiryDate",
      className: "",
    },
    {
      title: "Trạng thái thẻ",
      dataIndex: "status",
      key: "status",
      className: "",
      render: (status) => (
        <Tag
          color={
            status === "Đang lưu thông"
              ? "green"
              : status === "Chờ kích hoạt"
              ? "yellow"
              : status === "Cấm mượn"
              ? "red"
              : "gray"
          }
        >
          {status}
        </Tag>
      ),
    },
  ];

  // Filtering is now handled by the API through Redux actions

  return (
    <Modal
      title={<span className="text-lg font-medium">Danh sách thẻ đọc</span>}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <div className="text-lg font-medium mb-3 text-gray-700 border-b pb-2">
          Bộ lọc tìm kiếm
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* First row of filters */}
          <div className="space-y-1">
            <div className="font-medium text-gray-600">Loại thẻ</div>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              onChange={handleCardTypeChange}
              className="w-full"
            >
              <Option value="all">-- Tất cả --</Option>
              <Option value="student">Học sinh</Option>
              <Option value="teacher">Giáo viên</Option>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="font-medium text-gray-600">Trạng thái thẻ</div>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              onChange={handleCardStatusChange}
              className="w-full"
            >
              <Option value="all">-- Tất cả --</Option>
              <Option value="active">Đang lưu thông</Option>
              <Option value="waiting">Chờ kích hoạt</Option>
              <Option value="banned">Cấm mượn</Option>
              <Option value="other">Khác</Option>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="font-medium text-gray-600">Hạn sử dụng</div>
            <Select
              defaultValue="all"
              style={{ width: "100%" }}
              onChange={handleExpiryChange}
              className="w-full"
            >
              <Option value="all">-- Tất cả --</Option>
              <Option value="valid">Còn hạn</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
          </div>
        </div>

        {/* Second row with conditional filters and search inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardTypeFilter === 1 && (
            <>
              <div className="space-y-1">
                <div className="font-medium text-gray-600">Tổ/Bộ môn</div>
                <Select
                  defaultValue="all"
                  style={{ width: "100%" }}
                  loading={loadingTeacherGroupSubjects}
                  onChange={(value) => {
                    if (value === "all") {
                      dispatch(updateFilters({ teacherGroupSubjectId: null }));
                    } else {
                      dispatch(
                        updateFilters({
                          teacherGroupSubjectId: parseInt(value),
                        })
                      );
                    }
                    dispatch(fetchStudents({ page: 1 }));
                  }}
                  className="w-full"
                >
                  <Option value="all">-- Tất cả --</Option>
                  {Array.isArray(teacherGroupSubjects) &&
                  teacherGroupSubjects.length > 0 ? (
                    teacherGroupSubjects.map((group) => (
                      <Option key={group.id} value={group.id.toString()}>
                        {group.name}
                      </Option>
                    ))
                  ) : (
                    <Option value="" disabled>
                      Không có dữ liệu
                    </Option>
                  )}
                </Select>
              </div>
            </>
          )}
          {cardTypeFilter === 2 && (
            <>
              <div className="space-y-1">
                <div className="font-medium text-gray-600">Khối</div>
                <Select
                  defaultValue="all"
                  style={{ width: "100%" }}
                  loading={loadingGradeCodes}
                  onChange={(value) => {
                    if (value === "all") {
                      dispatch(updateFilters({ gradeCode: null }));
                      setSelectedGradeCode(null);
                    } else {
                      dispatch(updateFilters({ gradeCode: value }));
                      setSelectedGradeCode(value);
                      dispatch(fetchSchoolClasses(value));
                    }
                    dispatch(fetchStudents({ page: 1 }));
                  }}
                  className="w-full"
                >
                  <Option value="all">-- Tất cả --</Option>
                  {gradeCodes?.map((grade) => (
                    <Option key={grade.id} value={grade.code.toString()}>
                      {grade.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-600">Lớp</div>
                <Select
                  defaultValue="all"
                  style={{ width: "100%" }}
                  loading={loadingSchoolClasses}
                  onChange={(value) => {
                    if (value === "all") {
                      dispatch(updateFilters({ schoolClassId: null }));
                    } else {
                      dispatch(
                        updateFilters({ schoolClassId: parseInt(value) })
                      );
                    }
                    dispatch(fetchStudents({ page: 1 }));
                  }}
                  disabled={!selectedGradeCode}
                  className="w-full"
                >
                  <Option value="all">-- Tất cả --</Option>
                  {schoolClasses?.map((schoolClass) => (
                    <Option
                      key={schoolClass.id}
                      value={schoolClass.id.toString()}
                    >
                      {schoolClass.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <div className="font-medium text-gray-600">Tìm theo mã thẻ</div>
            <Input
              placeholder="Nhập mã thẻ..."
              value={cardNumber}
              onChange={(e) => handleSearchCardNumber(e.target.value)}
              suffix={<SearchOutlined />}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <div className="font-medium text-gray-600">Tìm kiếm</div>
            <Input
              placeholder="Tìm theo tên, lớp..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              suffix={<SearchOutlined />}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 bg-white">
            <Spin size="large" />
            <div className="mt-2 text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : readers.length > 0 ? (
          <Table
            columns={columns}
            dataSource={readers}
            rowKey={(record) => `reader-selection-${record.cardId}`}
            pagination={false}
            size="middle"
            rowClassName={(_, index) =>
              index % 2 === 0
                ? "bg-white hover:bg-blue-50"
                : "bg-gray-50 hover:bg-blue-50"
            }
            className="border-collapse"
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 text-gray-500 flex flex-col items-center justify-center">
            <div className="text-5xl mb-3">📚</div>
            <div className="text-lg">Không tìm thấy dữ liệu phù hợp</div>
            <div className="text-sm text-gray-400 mt-1">
              Vui lòng thử lại với các bộ lọc khác
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <Button
              size="small"
              className="flex items-center justify-center px-3 py-1 h-8 border-0 rounded-none hover:bg-blue-50"
              disabled={pagination.current <= 1}
              onClick={() => handlePageChange(pagination.current - 1)}
            >
              «
            </Button>
            <div className="px-3 py-1 bg-white border-x border-gray-300 min-w-[40px] text-center">
              {pagination.current}
            </div>
            <Button
              size="small"
              className="flex items-center justify-center px-3 py-1 h-8 border-0 rounded-none hover:bg-blue-50"
              disabled={
                pagination.current >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => handlePageChange(pagination.current + 1)}
            >
              »
            </Button>
          </div>
          <span className="text-gray-600">
            Trang {pagination.current} /{" "}
            {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Hiển thị</span>
          <Select
            defaultValue={pagination.pageSize.toString()}
            size="small"
            style={{ width: 70 }}
            className="text-sm"
            onChange={(value) => handlePageSizeChange(Number(value))}
            popupMatchSelectWidth={false}
          >
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
            <Option value="100">100</Option>
          </Select>
          <span className="text-gray-600 mr-4">mục / trang</span>

          <div className="bg-blue-50 px-3 py-1 rounded border border-blue-100">
            <span className="text-blue-700 font-medium">
              Tổng cộng: {pagination.total} bạn đọc
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReaderSelectionModal;
