"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Result } from "antd";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để hiển thị UI cho lỗi
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Ghi log lỗi
    console.error("Lỗi ứng dụng:", error, errorInfo);
  }

  handleRetry = (): void => {
    // Reset state để thử lại
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback nếu được cung cấp, hoặc sử dụng mặc định
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI mặc định khi có lỗi
      return (
        <Result
          status="error"
          title="Đã có lỗi xảy ra"
          subTitle={this.state.error?.message || "Vui lòng thử lại sau"}
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              Thử lại
            </Button>
          }
        />
      );
    }

    // Khi không có lỗi, hiển thị children bình thường
    return this.props.children;
  }
}

export default ErrorBoundary;
