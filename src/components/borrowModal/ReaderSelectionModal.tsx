"use client";

import React, { useState } from "react";
import { Modal, Input, Select, Table, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface ReaderSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (reader: ReaderInfo) => void;
}

interface ReaderInfo {
  cardId: string;
  name: string;
  cardType: string;
  class: string;
  expiryDate: string;
  status: string;
}

const { Option } = Select;

const ReaderSelectionModal: React.FC<ReaderSelectionModalProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const [searchText, setSearchText] = useState("");

  // Mock data for the table
  const mockReaders: ReaderInfo[] = [
    {
      cardId: "0140133365",
      name: "Bùi Khánh An",
      cardType: "Học sinh",
      class: "6A8",
      expiryDate: "30/05/2028",
      status: "Cấm mượn",
    },
    {
      cardId: "2740125365",
      name: "Đào Bá Khánh An",
      cardType: "Học sinh",
      class: "6A6",
      expiryDate: "30/05/2028",
      status: "Đang lưu thông",
    },
    {
      cardId: "0132930157",
      name: "Đinh Hà An",
      cardType: "Học sinh",
      class: "7A6",
      expiryDate: "30/05/2027",
      status: "Đang lưu thông",
    },
    {
      cardId: "0133052618",
      name: "Đinh Hà An",
      cardType: "Học sinh",
      class: "9A1",
      expiryDate: "30/05/2026",
      status: "Đang lưu thông",
    },
    {
      cardId: "2648429185",
      name: "Đỗ Khánh An",
      cardType: "Học sinh",
      class: "6A6",
      expiryDate: "30/05/2028",
      status: "Đang lưu thông",
    },
    {
      cardId: "0117763035",
      name: "Đỗ Thiên An",
      cardType: "Học sinh",
      class: "9A4",
      expiryDate: "30/05/2026",
      status: "Cấm mượn",
    },
    {
      cardId: "0132639576",
      name: "Hồ Hoài An",
      cardType: "Học sinh",
      class: "7A8",
      expiryDate: "30/05/2027",
      status: "Đang lưu thông",
    },
    {
      cardId: "0133052059",
      name: "Hồ Khánh An",
      cardType: "Học sinh",
      class: "7A3",
      expiryDate: "30/05/2027",
      status: "Đang lưu thông",
    },
    {
      cardId: "3040125367",
      name: "Hoàng Hà Hoài An",
      cardType: "Học sinh",
      class: "6A7",
      expiryDate: "30/05/2028",
      status: "Đang lưu thông",
    },
    {
      cardId: "0140881712",
      name: "Lại Thái An",
      cardType: "Học sinh",
      class: "7A5",
      expiryDate: "30/05/2027",
      status: "Đang lưu thông",
    },
    {
      cardId: "0131998179",
      name: "Lê Bảo An",
      cardType: "Học sinh",
      class: "6A9",
      expiryDate: "30/05/2028",
      status: "Đang lưu thông",
    },
    {
      cardId: "0117761073",
      name: "Lê Hà An",
      cardType: "Học sinh",
      class: "8A8",
      expiryDate: "30/05/2027",
      status: "Đang lưu thông",
    },
    {
      cardId: "0133052734",
      name: "Lê Minh An",
      cardType: "Học sinh",
      class: "9A4",
      expiryDate: "30/05/2026",
      status: "Đang lưu thông",
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleSelect = (record: ReaderInfo) => {
    onSelect(record);
    onCancel();
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
          className=" hover:bg-green-600"
          onClick={() => handleSelect(record)}
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
        <span
          className={
            status === "Đang lưu thông" ? "text-green-500" : "text-red-500"
          }
        >
          {status}
        </span>
      ),
    },
  ];

  // Filter readers based on search text
  const filteredReaders = searchText
    ? mockReaders.filter(
        (reader) =>
          reader.name.toLowerCase().includes(searchText.toLowerCase()) ||
          reader.cardId.includes(searchText)
      )
    : mockReaders;

  return (
    <Modal
      title={<span className="text-lg font-medium">Danh sách thẻ đọc</span>}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <div className="mb-2">Loại thẻ</div>
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">-- Tất cả --</Option>
            <Option value="student">Học sinh</Option>
            <Option value="teacher">Giáo viên</Option>
          </Select>
        </div>

        <div>
          <div className="mb-2">Trạng thái thẻ</div>
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">-- Tất cả --</Option>
            <Option value="active">Đang lưu thông</Option>
            <Option value="inactive">Cấm mượn</Option>
          </Select>
        </div>

        <div>
          <div className="mb-2">Hạn sử dụng</div>
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">-- Tất cả --</Option>
            <Option value="valid">Còn hạn</Option>
            <Option value="expired">Hết hạn</Option>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          suffix={<SearchOutlined />}
          style={{ width: 240 }}
        />
      </div>

      <div className="border border-gray-200 rounded mb-4">
        <Table
          columns={columns}
          dataSource={filteredReaders}
          rowKey={(record) => `reader-selection-${record.cardId}`}
          pagination={false}
          size="small"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }
          className="border-collapse"
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1">
          <Button
            size="small"
            className="flex items-center justify-center px-2 py-0 h-6"
          >
            «
          </Button>
          <Button
            size="small"
            className="flex items-center justify-center px-2 py-0 h-6 bg-gray-200"
          >
            1
          </Button>
          <Button
            size="small"
            className="flex items-center justify-center px-2 py-0 h-6"
          >
            »
          </Button>
          <span className="ml-2 text-gray-600">trên 38 trang</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-600">Hiển thị</span>
          <Select
            defaultValue="50"
            size="small"
            style={{ width: 60 }}
            className="text-xs"
          >
            <Option value="10">10</Option>
            <Option value="20">20</Option>
            <Option value="50">50</Option>
            <Option value="100">100</Option>
          </Select>
          <span className="text-gray-600">của 1 trang</span>
        </div>

        <div>
          <span className="text-gray-600">Tổng 1.856 bản ghi</span>
        </div>
      </div>
    </Modal>
  );
};

export default ReaderSelectionModal;
