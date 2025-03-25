"use client";

import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingIndicatorProps {
  size?: "small" | "default" | "large";
  text?: string;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "default",
  text = "Đang tải...",
  fullScreen = false,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <Spin indicator={antIcon} size={size} />
          {text && <div className="mt-2">{text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4">
      <div className="text-center">
        <Spin indicator={antIcon} size={size} />
        {text && <div className="mt-2">{text}</div>}
      </div>
    </div>
  );
};

export default LoadingIndicator;
