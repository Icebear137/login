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

const { Title } = Typography;
const { Item } = Form;

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
      footer={[
        <Button key="close" onClick={handleCancel}>
          Đóng
        </Button>,
        <Button key="print" type="primary" className="ml-2">
          In phiếu
        </Button>,
      ]}
    >
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : selectedLoan ? (
        <div>
          <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-md">
            <div className="flex items-center">
              <span className="text-green-700 font-medium">
                Số sách đang mượn:
              </span>
              <span className="text-red-500 font-bold text-xl ml-2">
                {selectedLoan.books.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left column - Reader information */}
            <div className="border rounded-md p-4">
              <div className="mb-3 border-b pb-2">
                <Title level={5} className="m-0">
                  Thông tin bạn đọc
                </Title>
              </div>
              <Form layout="vertical" className="grid grid-cols-1 gap-2">
                <Item
                  label={
                    <span className="font-medium">
                      Mã thẻ <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <div className="flex">
                    <Input value={selectedLoan.cardNumber} readOnly disabled />
                    <Button icon={<CopyOutlined />} className="ml-1" />
                  </div>
                </Item>
                <Item label={<span className="font-medium">Họ và tên</span>}>
                  <Input value={selectedLoan.fullName} readOnly disabled />
                </Item>
                <Item
                  label={<span className="font-medium">Lớp/Tổ bộ môn</span>}
                >
                  <Input
                    value={
                      selectedLoan.schoolClassName ||
                      selectedLoan.teacherGroupSubjectName ||
                      "N/A"
                    }
                    readOnly
                    disabled
                  />
                </Item>
                <Item
                  label={<span className="font-medium">Trạng thái thẻ</span>}
                >
                  <Input value="Đang lưu thông" readOnly disabled />
                </Item>
                <Item
                  label={
                    <span className="font-medium">
                      Ngày hết hạn thẻ <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    disabled
                    placeholder="30/05/2028"
                  />
                </Item>
              </Form>
            </div>

            {/* Right column - Loan information */}
            <div className="border rounded-md p-4">
              <div className="mb-3 border-b pb-2">
                <Title level={5} className="m-0">
                  Thông tin mượn
                </Title>
              </div>
              <Form layout="vertical" className="grid grid-cols-1 gap-2">
                <Item
                  label={
                    <span className="font-medium">Số đăng ký cá biệt</span>
                  }
                >
                  <div className="flex">
                    <Input value="" readOnly disabled />
                    <Button icon={<CopyOutlined />} className="ml-1" />
                  </div>
                </Item>
                <Item
                  label={
                    <span className="font-medium">
                      Số phiếu mượn <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <Input value={selectedLoan.loanCode} readOnly disabled />
                </Item>
                <Item
                  label={
                    <span className="font-medium">
                      Cán bộ thư viện <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <Input value="Trần Thị Thùy Diệu" readOnly disabled />
                </Item>
                <Item
                  label={
                    <span className="font-medium">
                      Ngày Mượn <span className="text-red-500">*</span>
                    </span>
                  }
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{ width: "100%" }}
                    disabled
                    // Using placeholder instead of value/defaultValue to avoid DatePicker issues
                    placeholder={
                      selectedLoan.loanDate
                        ? new Date(selectedLoan.loanDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"
                    }
                  />
                </Item>
                <Item label={<span className="font-medium">Ghi chú</span>}>
                  <Input.TextArea
                    rows={1}
                    value={selectedLoan.note || ""}
                    readOnly
                    disabled
                  />
                </Item>
              </Form>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <div className="mb-3 border-b pb-2">
              <Title level={5} className="m-0">
                Danh sách tài liệu
              </Title>
            </div>
            <Table
              columns={bookColumns}
              dataSource={selectedLoan.books.map((book, index) => ({
                ...book,
                key: `book-${book.id}-${index}`,
              }))}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          Không tìm thấy thông tin phiếu mượn
        </div>
      )}
    </Modal>
  );
};

export default LoanDetailModal;
