"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Space,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  LoadingOutlined, // Sẽ sử dụng sau này
} from "@ant-design/icons";
import ReaderSelectionModal from "./ReaderSelectionModal";
import BookSelectionModal from "./BookSelectionModal";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchStudentByCardNumber } from "@/redux/slices/studentSlice";
import { fetchLoanCode } from "@/redux/slices/borrowSlice";

interface BorrowModalProps {
  visible: boolean;
  onCancel: () => void;
}

interface BookItem {
  key: string;
  title: string;
  isbn: string;
  author: string;
  status: string;
}

interface BookInfo {
  id: string;
  title: string;
  publisher: string;
  publishYear: string;
  available: number;
  total: number;
  author?: string;
  borrowQuantity?: number;
  registrationNumber?: string;
}

// Interface không còn cần thiết vì chúng ta sử dụng Student từ API
// interface ReaderInfo {
//   cardId: string;
//   name: string;
//   cardType: string;
//   class: string;
//   expiryDate: string;
//   status: string;
//   totalBorrowedBooks: number;
//   totalBorrowingBooks: number;
//   totalReturnBooks: number;
// }

const { Option } = Select;

const BorrowModal: React.FC<BorrowModalProps> = ({ visible, onCancel }) => {
  // Function to reset all reader data - wrapped in useCallback to avoid dependency issues
  // Khai báo state trước khi sử dụng trong useCallback
  const [bookData, setBookData] = useState<BookItem[]>([]);
  const [readerModalVisible, setReaderModalVisible] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // Form state
  const [fullName, setFullName] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [cardStatus, setCardStatus] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<dayjs.Dayjs | null>(null);
  const [librarian, setLibrarian] = useState<string>("");
  const [borrowDate, setBorrowDate] = useState<dayjs.Dayjs>(dayjs());
  const [notes, setNotes] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");

  // Function to reset all reader data - wrapped in useCallback to avoid dependency issues
  const resetReaderData = useCallback(() => {
    setSelectedCardId("");
    setFullName("");
    setClassName("");
    setCardStatus("");
    setExpiryDate(null);
    setBookData([]); // Reset book data
    setRegistrationNumber(""); // Reset registration number
    // Không reset dữ liệu mượn sách như librarian, borrowDate, notes
  }, [
    setSelectedCardId,
    setFullName,
    setClassName,
    setCardStatus,
    setExpiryDate,
    setBookData,
    setRegistrationNumber,
  ]);
  const [readerForm] = Form.useForm();

  // Mock data for the table
  const mockBookData: BookItem[] = [];

  const dispatch = useDispatch();
  const { selectedStudent, loading: studentLoading } = useSelector(
    (state: RootState) => state.student
  );

  const { loanCode, loadingLoanCode } = useSelector(
    (state: RootState) => state.borrow
  );

  console.log("loanCode:", loanCode);

  // Handle reader selection
  const handleReaderSelect = (cardNumber: string) => {
    console.log("Selected card number:", cardNumber);
    setSelectedCardId(cardNumber);

    // Fetch student data by card number
    dispatch(fetchStudentByCardNumber(cardNumber));
  };

  // Fetch loan code when modal is opened
  useEffect(() => {
    if (visible) {
      dispatch(fetchLoanCode());
    } else {
      // Reset data when modal is closed
      resetReaderData();
    }
  }, [visible, dispatch, resetReaderData]);

  // Log loan code when it changes
  useEffect(() => {
    console.log("Loan code in component:", loanCode);
  }, [loanCode]);

  // Update form state when student data is loaded
  useEffect(() => {
    if (selectedStudent) {
      setFullName(selectedStudent.fullName);
      setClassName(
        selectedStudent.schoolClassName ||
          selectedStudent.teacherGroupSubjectName ||
          "N/A"
      );
      setCardStatus(
        selectedStudent.cardStatus === 1
          ? "active"
          : selectedStudent.cardStatus === 2
          ? "waiting"
          : selectedStudent.cardStatus === 3
          ? "banned"
          : "other"
      );
      setExpiryDate(dayjs(selectedStudent.expireDate));

      console.log("Updated form state from API");
    }
  }, [selectedStudent]);

  // Handle book selection
  const handleBookSelect = (books: BookInfo[]) => {
    // Create multiple entries for each book based on borrowQuantity
    const newBooks: BookItem[] = [];

    books.forEach((book) => {
      const quantity = book.borrowQuantity || 1;

      // Create 'quantity' number of entries for this book
      for (let i = 0; i < quantity; i++) {
        newBooks.push({
          key: `book-${book.id}-${i}`,
          title: book.title,
          isbn: book.id,
          author: book.author || "",
          status: book.available > 0 ? "available" : "unavailable",
        });
      }
    });

    console.log("Selected books with quantities:", books);
    console.log("Generated book entries:", newBooks);
    setBookData(newBooks);
  };

  // Handle book deletion
  const handleDeleteBook = (key: React.Key) => {
    console.log("Deleting book with key:", key);
    setBookData(bookData.filter((item) => item.key !== key));
  };

  // Convert BookItem[] to BookInfo[] for BookSelectionModal
  const getSelectedBooksForModal = (): BookInfo[] => {
    // Group books by isbn (which is the book id)
    const bookGroups: { [key: string]: number } = {};

    bookData.forEach((book) => {
      if (bookGroups[book.isbn]) {
        bookGroups[book.isbn]++;
      } else {
        bookGroups[book.isbn] = 1;
      }
    });

    // Convert to BookInfo[] with borrowQuantity
    return Object.keys(bookGroups).map((isbn) => {
      // Find a book with this isbn to get its details
      const bookItem = bookData.find((item) => item.isbn === isbn);

      return {
        id: isbn,
        title: bookItem?.title || "",
        publisher: "", // We don't have this info in BookItem
        publishYear: "", // We don't have this info in BookItem
        available: 1, // Default value
        total: 1, // Default value
        author: bookItem?.author || "",
        borrowQuantity: bookGroups[isbn],
        selected: true,
      };
    });
  };

  const columns: ColumnsType<BookItem> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Xóa",
      key: "delete",
      width: 70,
      render: (_, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer", color: "red" }}
          onClick={() => handleDeleteBook(record.key)}
        />
      ),
    },
    {
      title: "Nhan đề ấn phẩm",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Số ĐKCB",
      dataIndex: "isbn",
      key: "isbn",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
  ];

  const handleFinish = () => {
    // Handle form submission with state values instead of form values
    const formData = {
      cardId: selectedCardId,
      fullName,
      class: className,
      cardStatus,
      expiryDate: expiryDate?.format("YYYY-MM-DD"),
      borrowId: loanCode,
      librarian,
      borrowDate: borrowDate?.format("YYYY-MM-DD"),
      notes,
      registrationNumber,
      books: bookData,
    };

    console.log("Form data:", formData);
    resetReaderData(); // Reset reader data before closing
    onCancel();
  };

  return (
    <Modal
      title="Lập phiếu mượn sách"
      open={visible}
      onCancel={() => {
        resetReaderData(); // Reset reader data when modal is closed
        onCancel();
      }}
      width={1000}
      footer={null}
      centered
    >
      {selectedCardId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate__animated animate__fadeIn">
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
              {studentLoading ? (
                <LoadingOutlined />
              ) : (
                selectedStudent?.totalBorrowingBooks || 0
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-700">
                Tổng số sách đã mượn
              </div>
              <div className="bg-blue-100 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-blue-600">
              {studentLoading ? (
                <LoadingOutlined />
              ) : (
                selectedStudent?.totalBorrowedBooks || 0
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-green-700">
                Số sách đã trả
              </div>
              <div className="bg-green-100 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-green-600">
              {studentLoading ? (
                <LoadingOutlined />
              ) : (
                selectedStudent?.totalReturnBooks || 0
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
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
            <Form layout="vertical" form={readerForm}>
              <Form.Item label="Mã thẻ" required className="mb-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã thẻ hoặc chọn bạn đọc"
                    value={selectedCardId}
                    suffix={studentLoading ? <LoadingOutlined /> : <span />}
                    className="rounded-md"
                    allowClear={!!selectedCardId}
                    onClear={() => {
                      setSelectedCardId("");
                      setFullName("");
                      setClassName("");
                      setCardStatus("");
                      setExpiryDate(null);
                      setBookData([]);
                      setRegistrationNumber("");
                    }}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    className="flex items-center justify-center"
                    onClick={() => setReaderModalVisible(true)}
                    type="primary"
                  />
                </div>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Form.Item label="Họ và tên" className="mb-3">
                    <Input
                      placeholder=""
                      disabled
                      value={fullName}
                      className="rounded-md bg-gray-50"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Lớp/Tổ bộ môn" className="mb-3">
                    <Input
                      placeholder=""
                      disabled
                      value={className}
                      className="rounded-md bg-gray-50"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Trạng thái thẻ" className="mb-3">
                    <Select
                      value={cardStatus}
                      disabled
                      style={{ width: "100%" }}
                      className="rounded-md"
                    >
                      <Option value="active">Đang lưu thông</Option>
                      <Option value="waiting">Chờ kích hoạt</Option>
                      <Option value="banned">Cấm mượn</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Ngày hết hạn thẻ" className="mb-3">
                    <DatePicker
                      format="DD/MM/YYYY"
                      disabled
                      style={{ width: "100%" }}
                      value={expiryDate}
                      className="rounded-md bg-gray-50"
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>

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
                    placeholder={
                      !selectedCardId
                        ? "Vui lòng chọn bạn đọc trước"
                        : "Nhập số đăng ký hoặc chọn sách"
                    }
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="rounded-md"
                    disabled={!selectedCardId}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    className="flex items-center justify-center"
                    onClick={() => {
                      if (selectedCardId) {
                        setBookModalVisible(true);
                      }
                    }}
                    type="primary"
                    disabled={!selectedCardId}
                  />
                </div>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Form.Item label="Số phiếu mượn" required className="mb-3">
                    <Input
                      placeholder="Đang tạo mã phiếu..."
                      value={loanCode || ""}
                      disabled
                      prefix={<span className="text-gray-400 mr-1">#</span>}
                      suffix={loadingLoanCode ? <LoadingOutlined /> : <span />}
                      className="rounded-md bg-gray-50"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Cán bộ thư viện" required className="mb-3">
                    <Input
                      placeholder="Trần Thị Thùy Diệu"
                      value={librarian}
                      onChange={(e) => setLibrarian(e.target.value)}
                      className="rounded-md"
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
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Ngày Mượn" required className="mb-3">
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={borrowDate}
                      onChange={(date) => setBorrowDate(date)}
                      style={{ width: "100%" }}
                      className="rounded-md"
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
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label="Ghi chú" className="mb-3">
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-md"
                      placeholder="Nhập ghi chú nếu có..."
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
            columns={columns}
            dataSource={bookData.length > 0 ? bookData : mockBookData}
            pagination={false}
            locale={{
              emptyText: (
                <div className="py-5 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <div className="text-gray-500">
                    Chưa có sách nào được thêm vào phiếu mượn
                  </div>
                </div>
              ),
            }}
            className="border border-gray-200 rounded-md overflow-hidden"
            size="middle"
            rowClassName="hover:bg-blue-50"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Button
          onClick={onCancel}
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
        <Space>
          <Button
            type="primary"
            onClick={handleFinish}
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
            Xác nhận mượn và in phiếu
          </Button>
          <Button
            type="primary"
            onClick={handleFinish}
            className="bg-green-600 hover:bg-green-700 border-green-600 px-4 h-10 flex items-center"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            }
          >
            Xác nhận mượn
          </Button>
        </Space>
      </div>

      {/* Reader Selection Modal */}
      <ReaderSelectionModal
        visible={readerModalVisible}
        onCancel={() => setReaderModalVisible(false)}
        onSelect={handleReaderSelect}
      />

      {/* Book Selection Modal */}
      <BookSelectionModal
        visible={bookModalVisible}
        onCancel={() => setBookModalVisible(false)}
        onSelect={handleBookSelect}
        currentSelectedBooks={getSelectedBooksForModal()}
      />
    </Modal>
  );
};

export default BorrowModal;
