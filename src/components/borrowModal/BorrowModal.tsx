"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
  Space,
  Divider,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ReaderSelectionModal from "./ReaderSelectionModal";
import BookSelectionModal from "./BookSelectionModal";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

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

const BorrowModal: React.FC<BorrowModalProps> = ({ visible, onCancel }) => {
  const [readerForm] = Form.useForm();
  const [bookData, setBookData] = useState<BookItem[]>([]);
  const [readerModalVisible, setReaderModalVisible] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // Mock data for the table
  const mockBookData: BookItem[] = [];

  // Handle reader selection
  const handleReaderSelect = (reader: ReaderInfo) => {
    console.log("Selected reader:", reader);
    setSelectedCardId(reader.cardId);

    const formValues = {
      fullName: reader.name,
      class: reader.class,
      cardStatus: reader.status === "Đang lưu thông" ? "active" : "inactive",
      expiryDate: dayjs(reader.expiryDate, "DD/MM/YYYY"),
    };
    console.log("Setting form values:", formValues);
    readerForm.setFieldsValue(formValues);
  };

  // Handle book selection
  const handleBookSelect = (books: BookInfo[]) => {
    const newBooks = books.map((book) => ({
      key: book.id,
      title: book.title,
      isbn: book.id,
      author: book.author || "",
      status: book.available > 0 ? "available" : "unavailable",
    }));

    setBookData(newBooks);
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
      render: () => (
        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
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
    // Handle form submission
    const formValues = readerForm.getFieldsValue();
    console.log("Reader form values:", {
      ...formValues,
      cardId: selectedCardId,
    });
    console.log("Book data:", bookData);
    onCancel();
  };

  return (
    <Modal
      title="Lập phiếu mượn sách"
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      centered
    >
      <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded-md">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">
            Số sách đang mượn
          </div>
          <div className="text-xl font-bold text-red-500">1</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">
            Số sách còn được mượn
          </div>
          <div className="text-xl font-bold text-green-500">2</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">
            Số sách còn được mượn trên phiếu
          </div>
          <div className="text-xl font-bold text-green-500">2</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex mb-6">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-medium mb-4">Thông tin bạn đọc</h3>
            <Form layout="vertical" form={readerForm}>
              <Form.Item label="Mã thẻ" required>
                <div className="flex gap-1">
                  <Input
                    placeholder="2740125365"
                    readOnly
                    value={selectedCardId}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    className="ml-2"
                    onClick={() => setReaderModalVisible(true)}
                    type="primary"
                  />
                </div>
              </Form.Item>

              <Form.Item label="Họ và tên" name="fullName">
                <Input placeholder="Đào Bá Khánh An" disabled />
              </Form.Item>

              <Form.Item label="Lớp/Tổ bộ môn" name="class">
                <Input placeholder="6A6" disabled />
              </Form.Item>

              <Form.Item label="Trạng thái thẻ" name="cardStatus">
                <Select defaultValue="active" disabled>
                  <Option value="active">Đang lưu thông</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ngày hết hạn thẻ" name="expiryDate">
                <DatePicker
                  format="DD/MM/YYYY"
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Form>
          </div>

          <div className="w-1/2 pl-4">
            <h3 className="text-lg font-medium mb-4">Thông tin mượn</h3>
            <Form layout="vertical">
              <Form.Item label="Số đăng ký cá biệt" name="registrationNumber">
                <div className="flex gap-1">
                  <Input placeholder="" />
                  <Button
                    icon={<PlusOutlined />}
                    className="ml-2"
                    onClick={() => setBookModalVisible(true)}
                    type="primary"
                  />
                </div>
              </Form.Item>

              <Form.Item label="Số phiếu mượn" name="borrowId" required>
                <Input placeholder="PMU_20250408000578" />
              </Form.Item>

              <Form.Item label="Cán bộ thư viện" name="librarian" required>
                <Input placeholder="Trần Thị Thùy Diệu" />
              </Form.Item>

              <Form.Item label="Ngày Mượn" name="borrowDate" required>
                <DatePicker
                  format="DD/MM/YYYY"
                  defaultValue={dayjs("08/04/2025", "DD/MM/YYYY")}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label="Ghi chú" name="notes">
                <Input.TextArea rows={1} />
              </Form.Item>
            </Form>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Danh sách tài liệu</h3>
          <Table
            columns={columns}
            dataSource={bookData.length > 0 ? bookData : mockBookData}
            pagination={false}
            locale={{ emptyText: "Không có dữ liệu!" }}
          />
        </div>
      </div>

      <Divider />

      <div className="flex justify-end mt-4">
        <Button onClick={onCancel} className="mr-2">
          Đóng
        </Button>
        <Space>
          <Button type="primary" onClick={handleFinish}>
            Xác nhận mượn và in phiếu
          </Button>
          <Button type="primary" onClick={handleFinish}>
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
      />
    </Modal>
  );
};

export default BorrowModal;
