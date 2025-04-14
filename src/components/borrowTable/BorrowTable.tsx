"use client";
import React, { useEffect, useState } from "react";
import { Table, Select, Input, DatePicker, Button, Space, Tag } from "antd";
import BorrowModal from "../borrowModal/BorrowModal";
import LoanDetailModal from "./LoanDetailModal";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  FileTextOutlined,
  PlusOutlined,
  FilterOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { DatePickerProps } from "antd/es/date-picker";
import { useDispatch, useSelector } from "react-redux";
import type { Dayjs } from "dayjs";
import {
  fetchBorrowRecords,
  fetchBookBorrowRecords,
  updateFilters,
} from "@/redux/slices/borrowSlice";
import { RootState } from "@/redux/store";
import {
  BorrowRecord,
  BookRecord,
  ApiRecord,
  ApiBookRecord,
} from "@/types/schema";

const BorrowTable = () => {
  const dispatch = useDispatch();
  //get state from borrowSlice
  const { records, loading, pagination, filters } = useSelector(
    (state: RootState) => state.borrow
  );
  const [viewMode, setViewMode] = useState<"loan" | "book">("loan");
  const [filter, setFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  // Function to transform API data to loan table format
  const transformApiData = (apiRecords: ApiRecord[]): BorrowRecord[] => {
    if (!apiRecords || !Array.isArray(apiRecords) || apiRecords.length === 0) {
      return [];
    }

    try {
      return apiRecords.map((record) => ({
        id: record.id || 0,
        borrowId: record.loanCode || "N/A",
        cardNumber: record.cardNumber || "N/A",
        name: record.fullName || "N/A",
        class:
          record.schoolClassName || record.teacherGroupSubjectName || "N/A",
        type: record.cardTypeName || "N/A",
        borrowDate: formatDate(record.loanDate),
        returnDate: formatDate(record.expiredDate),
        booksCount: record.totalLoan || record.books?.length || 0,
        returned: record.totalReturn || 0,
        lost: record.totalLost || 0,
      }));
    } catch (error) {
      console.error("Error transforming API data:", error);
      return [];
    }
  };

  // Function to transform API data to book table format for flat structure
  const transformBookData = (bookRecords: ApiBookRecord[]): BookRecord[] => {
    if (
      !bookRecords ||
      !Array.isArray(bookRecords) ||
      bookRecords.length === 0
    ) {
      return [];
    }

    try {
      return bookRecords.map((book) => ({
        id: book.id || 0,
        registrationNumber: book.registrationNumber || "N/A",
        loanCode: book.loanCode || "N/A",
        title: book.title || "N/A",
        authors: book.authors || "N/A",
        publishingCompany: book.schoolPublishingCompanyName || "N/A",
        publishYear: book.publishYear?.toString() || "N/A",
        cardNumber: book.cardNumber || "N/A",
        fullName: book.fullName || "N/A",
        class: book.schoolClassName || book.teacherGroupSubjectName || "N/A",
        cardType: book.cardTypeName || "N/A",
        borrowDate: formatDate(book.loanDate),
        expiredDate: formatDate(book.loanExpiredDate),
        status: book.isReturn ? "Đã trả" : "Chưa trả",
      }));
    } catch (error) {
      console.error("Error transforming book data:", error);
      return [];
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("vi-VN");
  };

  // Fetch initial data when component mounts or view mode changes
  useEffect(() => {
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({}));
    } else {
      dispatch(fetchBookBorrowRecords({}));
    }
  }, [dispatch, viewMode]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    const newPage = newPagination.current || 1;
    const newPageSize = newPagination.pageSize || 10;

    if (viewMode === "loan") {
      dispatch(
        fetchBorrowRecords({
          page: newPage,
          pageSize: newPageSize,
        })
      );
    } else {
      dispatch(
        fetchBookBorrowRecords({
          page: newPage,
          pageSize: newPageSize,
        })
      );
    }
  };

  const loanColumns: ColumnsType<BorrowRecord & { key: string }> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Xem",
      key: "view",
      width: 70,
      render: (_, record) => (
        <FileTextOutlined
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedLoanId(record.borrowId);
            setDetailModalVisible(true);
          }}
        />
      ),
    },
    {
      title: "Số phiếu",
      dataIndex: "borrowId",
      key: "borrowId",
    },
    {
      title: "Mã thẻ",
      dataIndex: "cardNumber",
      key: "cardNumber",
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Lớp/Tổ bộ môn",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Đối tượng",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
    },
    {
      title: "Ngày hẹn trả",
      dataIndex: "returnDate",
      key: "returnDate",
    },
    {
      title: "Số sách mượn",
      dataIndex: "booksCount",
      key: "booksCount",
    },
    {
      title: "Đã trả",
      dataIndex: "returned",
      key: "returned",
    },
    {
      title: "Làm mất",
      dataIndex: "lost",
      key: "lost",
    },
  ];

  const handleSearch = (value: string) => {
    dispatch(updateFilters({ searchKey: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  // Book view columns
  const bookColumns: ColumnsType<BookRecord & { key: string }> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Xem",
      key: "view",
      width: 50,
      render: (_, record) => (
        <FileTextOutlined
          style={{ cursor: "pointer" }}
          onClick={() => {
            // Use the loan ID directly from the book record
            setSelectedLoanId(record.loanCode);
            setDetailModalVisible(true);
          }}
        />
      ),
    },
    {
      title: "Số ĐKCB",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      width: 120,
    },
    {
      title: "Số phiếu",
      dataIndex: "loanCode",
      key: "loanCode",
      width: 120,
    },
    {
      title: "Tiêu đề sách",
      dataIndex: "title",
      key: "title",
      width: 300,
    },
    {
      title: "Tác giả",
      dataIndex: "authors",
      key: "authors",
      width: 150,
    },
    {
      title: "Nhà xuất bản",
      dataIndex: "publishingCompany",
      key: "publishingCompany",
      width: 150,
    },
    {
      title: "Năm XB",
      dataIndex: "publishYear",
      key: "publishYear",
      width: 80,
    },
    {
      title: "Mã thẻ",
      dataIndex: "cardNumber",
      key: "cardNumber",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
    },
    {
      title: "Lớp/Tổ bộ môn",
      dataIndex: "class",
      key: "class",
      width: 120,
    },
    {
      title: "Đối tượng",
      dataIndex: "cardType",
      key: "cardType",
      width: 100,
    },
    {
      title: "Ngày mượn",
      dataIndex: "borrowDate",
      key: "borrowDate",
      width: 120,
    },
    {
      title: "Ngày hẹn trả",
      dataIndex: "expiredDate",
      key: "expiredDate",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "Đã trả" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  const handleFromDateChange: DatePickerProps["onChange"] = (date) => {
    setFromDate(date);
    if (date) {
      dispatch(
        updateFilters({
          fromDate: date.format("YYYY-MM-DD") + "T00:00:00",
        })
      );
    } else {
      dispatch(
        updateFilters({
          fromDate: "",
        })
      );
    }
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleToDateChange: DatePickerProps["onChange"] = (date) => {
    setToDate(date);
    if (date) {
      dispatch(
        updateFilters({
          toDate: date.format("YYYY-MM-DD") + "T23:59:59",
        })
      );
    } else {
      dispatch(
        updateFilters({
          toDate: "",
        })
      );
    }
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleCardTypeChange = (value: number | null) => {
    dispatch(updateFilters({ cardType: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleStatusChangeLoan = (value: number | null) => {
    dispatch(updateFilters({ loanStatus: value }));
    dispatch(fetchBorrowRecords({ page: 1 }));
  };
  const handleStatusChangeBook = (value: boolean | null) => {
    dispatch(updateFilters({ isReturn: value }));
    dispatch(fetchBookBorrowRecords({ page: 1 }));
  };

  const handleSortChange = (value: string | null) => {
    dispatch(updateFilters({ sortBy: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleSortDirectionChange = (value: boolean | null) => {
    dispatch(updateFilters({ sortDirection: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleSearchRegistrationNumber = (value: string) => {
    dispatch(updateFilters({ registrationNumber: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    } else {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleSearchTitle = (value: string) => {
    dispatch(updateFilters({ title: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    } else {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  // Function to refresh data based on current view mode
  const refreshData = () => {
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    } else {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleViewModeChange = (mode: "loan" | "book") => {
    setViewMode(mode);
    // Reset filters when changing view mode
    if (mode === "loan") {
      dispatch(
        updateFilters({
          searchKey: "",
          fromDate: "",
          toDate: "",
          cardType: null,
          loanStatus: null,
          sortBy: null,
          sortDirection: null,
        })
      );
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (mode === "book") {
      dispatch(
        updateFilters({
          searchKey: "",
          fromDate: "",
          toDate: "",
          cardType: null,
          loanStatus: null,
          isReturn: null,
          sortBy: null,
          sortDirection: null,
          registrationNumber: "",
          title: "",
        })
      );
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  // Initial data fetch based on view mode
  useEffect(() => {
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    } else {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  }, [dispatch, viewMode]);

  const deleteFilter = () => {
    // Reset date picker values
    setFromDate(null);
    setToDate(null);

    if (viewMode === "loan") {
      dispatch(
        updateFilters({
          searchKey: "",
          fromDate: "",
          toDate: "",
          cardType: null,
          loanStatus: null,
          sortBy: null,
          sortDirection: null,
        })
      );
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(
        updateFilters({
          searchKey: "",
          fromDate: "",
          toDate: "",
          cardType: null,
          loanStatus: null,
          isReturn: null,
          sortBy: null,
          sortDirection: null,
          registrationNumber: "",
          title: "",
        })
      );
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button
            type={viewMode === "loan" ? "primary" : "text"}
            onClick={() => handleViewModeChange("loan")}
            className={viewMode === "loan" ? "border-b-2 border-green-600" : ""}
          >
            Theo phiếu mượn
          </Button>
          <Button
            type={viewMode === "book" ? "primary" : "text"}
            onClick={() => handleViewModeChange("book")}
            className={viewMode === "book" ? "border-b-2 border-green-600" : ""}
          >
            Theo đầu sách
          </Button>
          <Space className="ml-4">
            <Button
              type="primary"
              onClick={() => setFilter(!filter)}
              icon={<FilterOutlined />}
            >
              Hiện bộ lọc
            </Button>
            <Button danger onClick={deleteFilter} icon={<DeleteOutlined />}>
              Xóa bộ lọc
            </Button>
          </Space>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Lập phiếu mượn
        </Button>
      </div>
      {filter && (
        <div className="flex justify-between items-center mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
            <Select
              className="w-full"
              placeholder="Loại thẻ"
              value={filters.cardType}
              onChange={handleCardTypeChange}
              allowClear
            >
              <Select.Option value={1}>Giáo viên</Select.Option>
              <Select.Option value={2}>Học sinh</Select.Option>
            </Select>

            <Input
              placeholder="Nhập họ tên, mã thẻ"
              value={filters.searchKey}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <div className="flex space-x-2 gap-2">
              <DatePicker
                className="w-full"
                placeholder="Ngày mượn từ"
                onChange={handleFromDateChange}
                format="DD/MM/YYYY"
                value={fromDate}
              />
              <DatePicker
                className="w-full"
                placeholder="Ngày mượn đến"
                onChange={handleToDateChange}
                format="DD/MM/YYYY"
                value={toDate}
              />
            </div>
            {viewMode === "loan" ? (
              <Select
                className="w-full"
                placeholder="Trạng thái"
                value={filters.loanStatus}
                onChange={handleStatusChangeLoan}
                allowClear
              >
                <Select.Option value={0}>Chưa trả</Select.Option>
                <Select.Option value={1}>Trả một phần</Select.Option>
                <Select.Option value={2}>Đã trả</Select.Option>
              </Select>
            ) : (
              <Select
                className="w-full"
                placeholder="Trạng thái"
                value={filters.isReturn}
                onChange={handleStatusChangeBook}
                allowClear
              >
                <Select.Option value={false}>Chưa trả</Select.Option>
                <Select.Option value={true}>Đã trả</Select.Option>
              </Select>
            )}

            <Select
              className="w-full"
              placeholder="Sắp xếp theo"
              value={filters.sortBy}
              onChange={handleSortChange}
              allowClear
            >
              <Select.Option value="borrowDate">Ngày mượn</Select.Option>
              <Select.Option value="expiredDate">Ngày hẹn trả</Select.Option>
              <Select.Option value="cardNumber">Mã thẻ thư viện</Select.Option>
              <Select.Option value="name">Họ và tên</Select.Option>
            </Select>

            <Select
              className="w-full"
              placeholder="Hướng sắp xếp"
              value={filters.sortDirection}
              onChange={handleSortDirectionChange}
              allowClear
            >
              <Select.Option value={false}>Tăng dần</Select.Option>
              <Select.Option value={true}>Giảm dần</Select.Option>
            </Select>

            {viewMode === "book" && (
              <>
                <Input
                  placeholder="Số đăng ký cá biệt"
                  value={filters.registrationNumber}
                  onChange={(e) =>
                    handleSearchRegistrationNumber(e.target.value)
                  }
                />
                <Input
                  placeholder="Nhan đề sách"
                  value={filters.title}
                  onChange={(e) => handleSearchTitle(e.target.value)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {viewMode === "loan" ? (
        <Table
          key={`loan-table-${pagination.current}`}
          columns={loanColumns}
          dataSource={
            Array.isArray(records)
              ? transformApiData(records as unknown as ApiRecord[]).map(
                  (record, index) => ({
                    ...record,
                    key: `loan-${record.id}-${index}`,
                  })
                )
              : []
          }
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            // Ensure total is consistent with data length
            ...(Array.isArray(records) && {
              total: Math.max(pagination.total, records.length),
            }),
            pageSizeOptions: [50, 100, 150, 200],
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 1000, y: 500 }}
          size="middle"
          bordered
          rowClassName={(_, index) =>
            index % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
        />
      ) : (
        <Table
          key={`book-table-${pagination.current}`}
          columns={bookColumns}
          dataSource={
            Array.isArray(records)
              ? transformBookData(records as unknown as ApiBookRecord[]).map(
                  (record, index) => ({
                    ...record,
                    key: `book-${record.id}-${index}`,
                  })
                )
              : []
          }
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
            // Ensure total is consistent with data length
            ...(Array.isArray(records) && {
              total: Math.max(pagination.total, records.length),
            }),
            pageSizeOptions: [50, 100, 150, 200],
          }}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 1000, y: 500 }}
          size="middle"
          bordered
          rowClassName={(_, index) =>
            index % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
        />
      )}

      <BorrowModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={refreshData} // Refresh data when borrow is successful
      />

      <LoanDetailModal
        visible={detailModalVisible}
        loanId={selectedLoanId}
        onCancel={() => setDetailModalVisible(false)}
      />
    </div>
  );
};

export default BorrowTable;
