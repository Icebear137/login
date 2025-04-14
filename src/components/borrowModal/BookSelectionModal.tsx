"use client";

import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, Checkbox, Spin, Select, Tag } from "antd";
import { useMessage } from "@/components/MessageProvider";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  fetchBookCatalogs,
  fetchBookTypes,
  fetchBookRegistrations,
  updateBookFilters,
  updateRegistrationFilters,
} from "@/redux/slices/bookSlice";
import { BookRegistration } from "@/types/schema";
import type { ColumnsType } from "antd/es/table";

interface BookSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (books: BookInfo[]) => void;
  currentSelectedBooks?: BookInfo[];
  remainingBooksAllowed?: number;
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

const { Option } = Select;

const BookSelectionModal: React.FC<BookSelectionModalProps> = ({
  // Component props
  visible,
  onCancel,
  onSelect,
  currentSelectedBooks = [],
  remainingBooksAllowed = 3, // Default to 3 if not provided
}) => {
  const [searchText, setSearchText] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [bookTypeId, setBookTypeId] = useState<number | undefined>(undefined);
  const [selectedBooks, setSelectedBooks] = useState<BookInfo[]>([]);
  const [viewMode, setViewMode] = useState<"title" | "registration">("title");

  // Update selectedBooks when currentSelectedBooks changes
  useEffect(() => {
    // Always sync with currentSelectedBooks, even when modal is not visible
    // This ensures that when books are deleted in BorrowModal, they are also unselected here
    setSelectedBooks(currentSelectedBooks);
  }, [currentSelectedBooks]);

  // Create a custom handler for modal cancel to reset borrowQuantity
  const handleModalCancel = () => {
    // Reset borrowQuantity to 0 for all books
    if (selectedBooks.length > 0) {
      const resetBooks = selectedBooks.map((book) => ({
        ...book,
        borrowQuantity: 0,
      }));
      setSelectedBooks(resetBooks);
    }

    // Call the original onCancel
    onCancel();
  };

  const dispatch = useDispatch();
  const messageApi = useMessage();
  const {
    bookCatalogs,
    bookTypes,
    bookRegistrations,
    loading,
    loadingBookTypes,
    loadingBookRegistrations,
    pagination,
    registrationPagination,
  } = useSelector((state: RootState) => state.book);

  // Fetch book types when component mounts (only once)
  useEffect(() => {
    dispatch(fetchBookTypes());
  }, [dispatch]);

  // Fetch initial data based on view mode
  useEffect(() => {
    if (viewMode === "title") {
      dispatch(fetchBookCatalogs({ page: 1, pageSize: 10 }));
    } else {
      dispatch(fetchBookRegistrations({ page: 1, pageSize: 10 }));
    }
  }, [dispatch, viewMode]);

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

  // Reset all filters and search inputs
  const resetFilters = () => {
    setSearchText("");
    setRegistrationNumber("");
    setBookTypeId(undefined);

    // Reset Redux filters
    dispatch(
      updateBookFilters({
        searchKey: "",
        bookTypeId: null,
      })
    );
    dispatch(
      updateRegistrationFilters({
        searchKey: "",
        registrationNumbers: "",
        bookTypeId: undefined,
      })
    );
  };

  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    if (value === "registration") {
      setViewMode("registration");
      resetFilters();
      dispatch(fetchBookRegistrations({ page: 1, pageSize: 10 }));
    } else {
      setViewMode("title");
      resetFilters();
      dispatch(fetchBookCatalogs({ page: 1, pageSize: 10 }));
    }
  };

  const handleSearchTitle = (value: string) => {
    setSearchText(value);
    if (viewMode === "title") {
      dispatch(updateBookFilters({ searchKey: value }));
      dispatch(fetchBookCatalogs({ page: 1 }));
    } else {
      dispatch(
        updateRegistrationFilters({
          searchKey: value,
        })
      );
      dispatch(fetchBookRegistrations({ page: 1 }));
    }
  };

  const handleSearchRegistrationNumber = (value: string) => {
    setRegistrationNumber(value);
    if (viewMode === "registration") {
      dispatch(updateRegistrationFilters({ registrationNumbers: value }));
      dispatch(fetchBookRegistrations({ page: 1 }));
    }
  };

  const handleSelectBook = (book: BookInfo) => {
    const isSelected = selectedBooks.some((b) => b.id === book.id);

    if (isSelected) {
      setSelectedBooks(selectedBooks.filter((b) => b.id !== book.id));
    } else {
      // Check if adding this book would exceed the remaining allowed books
      const totalSelectedBooks = selectedBooks.reduce(
        (total, book) => total + (book.borrowQuantity || 1),
        0
      );

      // If adding one more book would exceed the limit
      if (totalSelectedBooks + 1 > remainingBooksAllowed) {
        messageApi.error(
          `Bạn chỉ có thể mượn tối đa ${remainingBooksAllowed} quyển sách (bao gồm cả sách đang mượn)!`
        );
        return;
      }

      // Check if we can add this book with quantity 1
      const totalCurrentQuantity = selectedBooks.reduce(
        (total, b) => total + (b.borrowQuantity || 0),
        0
      );

      // Initialize borrowQuantity based on remaining allowed books
      const initialQuantity =
        totalCurrentQuantity < remainingBooksAllowed ? 1 : 0;

      // Make sure to include all necessary fields based on the view mode
      const bookWithQuantity = {
        ...book,
        borrowQuantity: initialQuantity,
        // Ensure these fields are included for both view modes
        registrationNumber: book.registrationNumber || "",
        publisher: book.publisher || "",
        publishYear: book.publishYear || "",
      };
      setSelectedBooks([...selectedBooks, bookWithQuantity]);

      // Show message if quantity is 0 due to limit
      if (initialQuantity === 0) {
        messageApi.warning(
          `Bạn đã đạt giới hạn ${remainingBooksAllowed} quyển sách. Không thể tăng số lượng.`
        );
      }
    }
  };

  const handleQuantityChange = (bookId: string, quantity: number) => {
    // Find the book in the appropriate data source based on view mode
    let book;
    if (viewMode === "title") {
      book = books.find((b) => b.id === bookId);
    } else {
      book = bookRegistrations.find((b) => b.id.toString() === bookId);
    }

    if (!book) return;

    // Ensure quantity is valid (minimum 0, maximum available)
    let available = 1;

    if (viewMode === "title" && "available" in book) {
      available = (book as BookInfo).available || 1;
    } else if (viewMode === "registration") {
      // For registration view, check bookStatusId (1 means available)
      const bookReg = book as BookRegistration;
      available = bookReg.bookStatusId === 1 ? 1 : 0;
    }

    // Don't allow negative quantities
    if (quantity < 0) {
      quantity = 0;
    }

    // Calculate the total quantity of all selected books except the current one
    const totalOtherBooks = selectedBooks.reduce(
      (total, b) => total + (b.id !== bookId ? b.borrowQuantity || 0 : 0),
      0
    );

    // Check if the new quantity would exceed the remaining allowed books
    if (totalOtherBooks + quantity > remainingBooksAllowed) {
      // Set quantity to maximum allowed
      quantity = Math.max(0, remainingBooksAllowed - totalOtherBooks);

      // Show warning message
      messageApi.warning(
        `Bạn chỉ có thể mượn tối đa ${remainingBooksAllowed} quyển sách (bao gồm cả sách đang mượn)!`
      );
    }

    // Ensure quantity doesn't exceed available books
    const validQuantity = Math.min(quantity, available);

    // Update the selected books with the new quantity
    setSelectedBooks(
      selectedBooks.map((book) =>
        book.id === bookId ? { ...book, borrowQuantity: validQuantity } : book
      )
    );
  };

  const handleBookTypeChange = (value: string) => {
    const newBookTypeId = value === "all" ? undefined : Number(value);
    setBookTypeId(newBookTypeId);

    // Update filters based on current view mode
    if (viewMode === "title") {
      dispatch(updateBookFilters({ bookTypeId: newBookTypeId }));
      dispatch(fetchBookCatalogs({ page: 1 }));
    } else {
      dispatch(updateRegistrationFilters({ bookTypeId: newBookTypeId }));
      dispatch(fetchBookRegistrations({ page: 1 }));
    }
  };

  const handleConfirm = () => {
    if (selectedBooks.length === 0) {
      // No books selected, just close the modal
      onCancel();
      return;
    }

    // Calculate total quantity of selected books
    let totalSelectedQuantity = 0;
    for (const book of selectedBooks) {
      totalSelectedQuantity += book.borrowQuantity || 0;
    }

    // Check if no books with quantity > 0 are selected
    if (totalSelectedQuantity === 0) {
      messageApi.error(
        "Vui lòng chọn ít nhất một quyển sách với số lượng lớn hơn 0"
      );
      return;
    }

    // Check if total quantity exceeds the remaining allowed books
    if (totalSelectedQuantity > remainingBooksAllowed) {
      // Use message.error for error notification
      messageApi.error(
        `Bạn chỉ có thể mượn tối đa ${remainingBooksAllowed} quyển sách (bao gồm cả sách đang mượn)!`
      );
      return; // Don't update the table in BorrowModal
    }

    // Filter out books with quantity 0
    const booksToAdd = selectedBooks.filter(
      (book) => (book.borrowQuantity || 0) > 0
    );

    // If quantity is valid, update the table in BorrowModal
    onSelect(booksToAdd);
    handleModalCancel();
  };

  // Define table columns for title view
  const titleColumns: ColumnsType<BookInfo> = [
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
      render: (_, record) => {
        // Find the selected book if it exists
        const selectedBook = selectedBooks.find((b) => b.id === record.id);
        // Get the current quantity (default to 0)
        const currentQuantity = selectedBook?.borrowQuantity || 0;

        return (
          <Input
            type="number"
            min={0}
            max={record.available}
            disabled={
              !selectedBooks.some((b) => b.id === record.id) ||
              record.available <= 0
            }
            value={currentQuantity}
            onChange={(e) =>
              handleQuantityChange(record.id, parseInt(e.target.value, 10))
            }
            style={{ width: 70 }}
          />
        );
      },
    },
  ];

  // Define interface for mapped registration data
  interface MappedRegistration {
    id: string;
    registrationNumber: string;
    title: string;
    publisher: string;
    publishYear: string;
    author: string;
    available: number;
    total: number;
  }

  // Define table columns for registration number view
  const registrationColumns: ColumnsType<MappedRegistration> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "",
      key: "select",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Checkbox
          checked={selectedBooks.some((b) => b.id === record.id)}
          onChange={() => handleSelectBook(record)}
          disabled={record.available <= 0}
        />
      ),
    },
    {
      title: "Số ĐKCB",
      dataIndex: "registrationNumber",
      key: "registrationNumber",
      width: 150,
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
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
    },
    {
      title: "Số lượng mượn",
      key: "borrowQuantity",
      width: 120,
      align: "center",
      render: (_, record) => {
        // Find the selected book if it exists
        const selectedBook = selectedBooks.find((b) => b.id === record.id);
        // Get the current quantity (default to 0)
        const currentQuantity = selectedBook?.borrowQuantity || 0;

        return (
          <Input
            type="number"
            min={0}
            max={record.available}
            disabled={
              !selectedBooks.some((b) => b.id === record.id) ||
              record.available <= 0
            }
            value={currentQuantity}
            onChange={(e) =>
              handleQuantityChange(record.id, parseInt(e.target.value, 10))
            }
            style={{ width: 70 }}
          />
        );
      },
    },
    {
      title: "Tình trạng sách",
      key: "status",
      width: 150,
      render: (_, record) => (
        <div>
          {record.available > 0 ? (
            <Tag color="green">Sách đang lưu thông</Tag>
          ) : (
            <Tag color="red">Sách chưa lưu thông</Tag>
          )}
        </div>
      ),
    },
  ];

  // We'll use separate columns for each view mode directly in the render function
  // This avoids TypeScript errors with different column structures

  // No need for local filtering as we're using API filtering

  return (
    <Modal
      title={
        <span className="text-lg font-medium">
          Chọn sách (Đã chọn: {selectedBooks.length} quyển)
        </span>
      }
      open={visible}
      onCancel={handleModalCancel}
      width={1000}
      footer={null}
    >
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xem theo
            </label>
            <Select
              value={viewMode === "title" ? "subject" : "registration"}
              style={{ width: "100%" }}
              className="rounded-md"
              onChange={handleViewModeChange}
            >
              <Option value="subject">Nhãn đề</Option>
              <Option value="registration">Số đăng ký cá biệt</Option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kho sách
            </label>
            <Select
              style={{ width: "100%" }}
              className="rounded-md"
              loading={loadingBookTypes}
              onChange={handleBookTypeChange}
              value={bookTypeId ? bookTypeId.toString() : "all"}
            >
              <Option value="all">-- Tất cả --</Option>
              {bookTypes?.map((type) => (
                <Option key={type.id} value={type.id.toString()}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Input
            placeholder="Tìm kiếm sách..."
            value={searchText}
            onChange={(e) => handleSearchTitle(e.target.value)}
            suffix={loading ? <LoadingOutlined /> : <SearchOutlined />}
            className="w-full rounded-md"
            allowClear
          />
          {viewMode === "registration" && (
            <Input
              placeholder="Nhập số đăng ký cá biệt..."
              value={registrationNumber}
              onChange={(e) => handleSearchRegistrationNumber(e.target.value)}
              suffix={loading ? <LoadingOutlined /> : <SearchOutlined />}
              className="w-full rounded-md"
              allowClear
            />
          )}
        </div>
      </div>

      {loading && bookCatalogs.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white">
          <Spin size="large" />
          <div className="mt-2 text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : viewMode === "title" ? (
        <Table
          columns={titleColumns}
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
          bordered
          rowClassName={(_, index) =>
            index % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
        />
      ) : (
        <Table
          columns={registrationColumns}
          dataSource={bookRegistrations.map((registration) => ({
            id: registration.id.toString(),
            registrationNumber: registration.registrationNumber,
            title: registration.title,
            publisher: registration.schoolPublishingCompanyName,
            publishYear: registration.publishYear?.toString() || "",
            author: registration.authors,
            available: registration.bookStatusId === 1 ? 1 : 0, // Assuming bookStatusId 1 means available
            total: 1,
          }))}
          rowKey="id"
          pagination={{
            current: registrationPagination.current,
            pageSize: registrationPagination.pageSize,
            total: registrationPagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, pageSize) => {
              dispatch(fetchBookRegistrations({ page, pageSize }));
            },
          }}
          size="middle"
          bordered
          loading={loadingBookRegistrations}
          rowClassName={(_, index) =>
            index % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
        />
      )}

      <div className="flex justify-end mt-4">
        <Button onClick={handleModalCancel} className="mr-2">
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
