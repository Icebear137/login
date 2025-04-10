"use client";

import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, Checkbox, Spin } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchBookCatalogs, updateBookFilters } from "@/redux/slices/bookSlice";
import type { ColumnsType } from "antd/es/table";

interface BookSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (books: BookInfo[]) => void;
  currentSelectedBooks?: BookInfo[];
}

interface BookInfo {
  id: string;
  title: string;
  publisher: string;
  publishYear: string;
  available: number;
  total: number;
  author?: string;
  selected?: boolean;
  registrationNumber?: string;
  borrowQuantity?: number;
}

// Removed unused Option declaration

const BookSelectionModal: React.FC<BookSelectionModalProps> = ({
  visible,
  onCancel,
  onSelect,
  currentSelectedBooks = [],
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<BookInfo[]>([]);

  // Update selectedBooks when currentSelectedBooks changes or modal becomes visible
  useEffect(() => {
    if (visible && currentSelectedBooks.length > 0) {
      setSelectedBooks(currentSelectedBooks);
    }
  }, [visible, currentSelectedBooks]);

  const dispatch = useDispatch();
  const { bookCatalogs, loading, pagination } = useSelector(
    (state: RootState) => state.book
  );

  // Fetch book catalogs when component mounts
  useEffect(() => {
    dispatch(fetchBookCatalogs({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  // Convert API data to BookInfo format
  const books: BookInfo[] = bookCatalogs?.map((catalog) => ({
    id: catalog.id.toString(),
    title: catalog.title,
    publisher: catalog.schoolPublishingCompanyName || "",
    publishYear: catalog.publishYear ? catalog.publishYear.toString() : "",
    available: catalog.totalBooksAvailable || 0,
    total: catalog.totalBooks || 0,
    author: catalog.authors,
    registrationNumber:
      catalog.books && catalog.books.length > 0
        ? catalog.books[0].registrationNumber
        : "",
  }));

  const handleSearch = (value: string) => {
    setSearchText(value);
    dispatch(updateBookFilters({ searchKey: value }));
    dispatch(fetchBookCatalogs({ page: 1 }));
  };

  const handleSelectBook = (book: BookInfo) => {
    const isSelected = selectedBooks.some((b) => b.id === book.id);

    if (isSelected) {
      setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
    } else {
      // When selecting a book, initialize borrowQuantity to 1
      setSelectedBooks([...selectedBooks, { ...book, borrowQuantity: 1 }]);
    }
  };

  const handleQuantityChange = (bookId: string, quantity: number) => {
    // Ensure quantity is valid
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const validQuantity = Math.max(1, Math.min(quantity, book.available));

    // Update the selected books with the new quantity
    setSelectedBooks(
      selectedBooks.map((book) =>
        book.id === bookId ? { ...book, borrowQuantity: validQuantity } : book
      )
    );
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
          disabled={record.available <= 0}
        />
      ),
      className: "",
    },
    {
      title: "Tiêu đề",
      key: "title",
      render: (_, record) => (
        <div className={record.available <= 0 ? "opacity-50" : ""}>
          <div>
            {record.title}
            {record.available <= 0 && (
              <span className="ml-2 text-xs text-red-500 font-medium">
                (Không có sẵn)
              </span>
            )}
          </div>
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
      key: "borrowQuantity",
      className: "",
      align: "center",
      render: (_, record) => (
        <Input
          type="number"
          min={1}
          max={record.available}
          disabled={
            !selectedBooks.some((b) => b.id === record.id) ||
            record.available <= 0
          }
          defaultValue={1}
          value={record.borrowQuantity}
          onChange={(e) =>
            handleQuantityChange(record.id, parseInt(e.target.value, 10))
          }
          style={{ width: 70 }}
        />
      ),
    },
  ];

  // No need for local filtering as we're using API filtering

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
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 w-full">
          <Input
            placeholder="Tìm kiếm sách..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            suffix={loading ? <LoadingOutlined /> : <SearchOutlined />}
            className="w-full"
          />
        </div>
      </div>

      {loading && bookCatalogs.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white">
          <Spin size="large" />
          <div className="mt-2 text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={books}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              dispatch(fetchBookCatalogs({ page, pageSize }));
            },
          }}
          size="middle"
          loading={loading}
        />
      )}

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
