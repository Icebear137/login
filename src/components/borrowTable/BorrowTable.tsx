"use client";
import React, { useEffect, useState } from "react";
import { Table, Select, Input, DatePicker, Button, Space } from "antd";
import BorrowModal from "../borrowModal/BorrowModal";
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

interface BorrowRecord {
  id: number;
  borrowId: string;
  cardNumber: string;
  name: string;
  class: string;
  type: string;
  borrowDate: string;
  returnDate: string;
  booksCount: number;
  returned: number;
  renewed: number;
}

const BorrowTable = () => {
  const dispatch = useDispatch();
  //get state from borrowSlice
  const { records, loading, pagination, filters } = useSelector(
    (state: RootState) => state.borrow
  );
  const [viewMode, setViewMode] = useState<"loan" | "book">("loan");
  const [filter, setFilter] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    dispatch(fetchBorrowRecords({}));
  }, [dispatch]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    dispatch(
      fetchBorrowRecords({
        page: newPagination.current,
        pageSize: newPagination.pageSize,
      })
    );
  };

  const columns: ColumnsType<BorrowRecord & { key: string }> = [
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
      render: () => <FileTextOutlined style={{ cursor: "pointer" }} />,
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
      dataIndex: "renewed",
      key: "renewed",
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

  const handleCardTypeChange = (value: number) => {
    dispatch(updateFilters({ cardType: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleStatusChange = (value: number) => {
    dispatch(updateFilters({ loanStatus: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleSortChange = (value: string) => {
    dispatch(updateFilters({ sortBy: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };

  const handleSortDirectionChange = (value: string) => {
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
    }
    if (viewMode === "book") {
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    }
  };
  const handleSearchTitle = (value: string) => {
    dispatch(updateFilters({ title: value }));
    if (viewMode === "loan") {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
    if (viewMode === "book") {
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
          cardType: undefined,
          loanStatus: undefined,
          sortBy: undefined,
          sortDirection: undefined,
        })
      );
    }
    if (mode === "book") {
      dispatch(
        updateFilters({
          searchKey: "",
          fromDate: "",
          toDate: "",
          cardType: undefined,
          loanStatus: undefined,
          sortBy: undefined,
          sortDirection: undefined,
          registrationNumber: "",
          title: "",
        })
      );
      dispatch(fetchBookBorrowRecords({ page: 1 }));
    } else {
      dispatch(fetchBorrowRecords({ page: 1 }));
    }
  };

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
          cardType: undefined,
          loanStatus: undefined,
          sortBy: undefined,
          sortDirection: undefined,
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
          cardType: undefined,
          loanStatus: undefined,
          sortBy: undefined,
          sortDirection: undefined,
          registrationNumber: undefined,
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

            <Select
              className="w-full"
              placeholder="Trạng thái"
              value={filters.loanStatus}
              onChange={handleStatusChange}
              allowClear
            >
              <Select.Option value={1}>Chưa trả</Select.Option>
              <Select.Option value={2}>Trả một phần</Select.Option>
              <Select.Option value={3}>Đã trả</Select.Option>
            </Select>

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
              <Select.Option value="false">Tăng dần</Select.Option>
              <Select.Option value="true">Giảm dần</Select.Option>
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

      <Table
        columns={columns}
        dataSource={records.map((record) => ({
          ...record,
          key: record.id.toString(),
        }))}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: true }}
        size="middle"
      />

      <BorrowModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default BorrowTable;
