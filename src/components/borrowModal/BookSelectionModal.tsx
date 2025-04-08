"use client";

import React, { useState } from "react";
import { Modal, Input, Select, Table, Button, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface BookSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (books: BookInfo[]) => void;
}

interface BookInfo {
  id: string;
  title: string;
  publisher: string;
  publishYear: string;
  available: number;
  total: number;
  selected?: boolean;
}

const { Option } = Select;

const BookSelectionModal: React.FC<BookSelectionModalProps> = ({
  visible,
  onCancel,
  onSelect,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<BookInfo[]>([]);

  // Mock data for the table
  const mockBooks: BookInfo[] = [
    {
      id: "124124245212412424",
      title: "124124245212412424",
      publisher: "Hồng Đức",
      publishYear: "2023",
      available: 2,
      total: 2,
    },
    {
      id: "124124",
      title: "124124",
      publisher: "Hồng Đức",
      publishYear: "2023",
      available: 2,
      total: 2,
    },
    {
      id: "title-moi-nhat",
      title: "đây là title mới nhất s",
      publisher: "Tư pháp",
      publishYear: "2024",
      available: 1,
      total: 1,
    },
    {
      id: "sa",
      title: "sa",
      publisher: "Tư pháp",
      publishYear: "2014",
      available: 2,
      total: 3,
    },
    {
      id: "sach-moi",
      title: "sách mới",
      publisher: "Hồng Đức",
      publishYear: "2009",
      available: 3,
      total: 4,
    },
    {
      id: "s-1",
      title: "s",
      publisher: "Tư pháp",
      publishYear: "2004",
      available: 0,
      total: 0,
    },
    {
      id: "re",
      title: "re",
      publisher: "Chính trị Quốc gia",
      publishYear: "2009",
      available: 0,
      total: 1,
    },
    {
      id: "s-2",
      title: "s",
      publisher: "Chính trị Quốc gia",
      publishYear: "2008",
      available: 0,
      total: 1,
      author: "Tùng MD",
    },
    {
      id: "truyen-ngan",
      title: "Truyện ngắn Nguyễn Huy Tưởng",
      publisher: "Văn học",
      publishYear: "2016",
      available: 9,
      total: 10,
      author: "Nguyễn Huy Tưởng",
    },
    {
      id: "fds",
      title: "fds",
      publisher: "Hồng Đức",
      publishYear: "2016",
      available: 0,
      total: 0,
    },
    {
      id: "tieng-anh-10",
      title: "Tiếng Anh 10 Global Success - Sách bài tập",
      publisher: "Giáo dục",
      publishYear: "2022",
      available: 5,
      total: 5,
      author: "Hoàng Văn Vân",
    },
    {
      id: "s-3",
      title: "s",
      publisher: "Tư pháp",
      publishYear: "2016",
      available: 0,
      total: 0,
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleSelectBook = (book: BookInfo) => {
    const isSelected = selectedBooks.some((b) => b.id === book.id);

    if (isSelected) {
      setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
    } else {
      setSelectedBooks([...selectedBooks, book]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedBooks);
    onCancel();
  };

  const columns: ColumnsType<BookInfo> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
      className: "",
    },
    {
      title: "",
      key: "select",
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedBooks.some((b) => b.id === record.id)}
          onChange={() => handleSelectBook(record)}
        />
      ),
      className: "",
    },
    {
      title: "Tiêu đề",
      key: "title",
      render: (_, record) => (
        <div>
          <div>{record.title}</div>
          <div className="text-xs text-gray-500">
            NXB: {record.publisher} - Năm XB: {record.publishYear}
          </div>
        </div>
      ),
      className: "",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      className: "",
    },
    {
      title: "Trong thư viện",
      dataIndex: "total",
      key: "total",
      className: "",
      align: "center",
    },
    {
      title: "Sẵn sàng cho mượn",
      dataIndex: "available",
      key: "available",
      className: "",
      align: "center",
    },
    {
      title: "Số lượng mượn",
      dataIndex: "total",
      key: "borrowCount",
      className: "",
      align: "center",
    },
  ];

  // Filter books based on search text
  const filteredBooks = searchText
    ? mockBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (book.author &&
            book.author.toLowerCase().includes(searchText.toLowerCase()))
      )
    : mockBooks;

  return (
    <Modal
      title={
        <span className="text-lg font-medium">
          Chọn sách (Đã chọn: {selectedBooks.length} quyển)
        </span>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <div className="mb-2">Xem theo</div>
          <Select defaultValue="subject" style={{ width: 200 }}>
            <Option value="subject">Nhãn đề</Option>
            <Option value="author">Tác giả</Option>
            <Option value="publisher">Nhà xuất bản</Option>
          </Select>
        </div>

        <div>
          <div className="mb-2">Kho sách</div>
          <Select defaultValue="all" style={{ width: 200 }}>
            <Option value="all">-- Tất cả --</Option>
            <Option value="main">Kho chính</Option>
            <Option value="reference">Kho tham khảo</Option>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm nhãn đề"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          suffix={<SearchOutlined />}
          style={{ width: 240 }}
        />
      </div>

      <div className="border border-gray-200 rounded mb-4">
        <Table
          columns={columns}
          dataSource={filteredBooks}
          rowKey="id"
          pagination={false}
          size="small"
          rowClassName={(record, index) =>
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
          <span className="ml-2 text-gray-600">trên 47 trang</span>
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
          <span className="text-gray-600">Tổng 50 bản ghi</span>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onCancel} className="mr-2">
          Hủy
        </Button>
        <Button type="primary" onClick={handleConfirm} className="">
          Xác nhận
        </Button>
      </div>
    </Modal>
  );
};

export default BookSelectionModal;
