"use client";

import React from 'react';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

// Create a context for the message API
export const MessageContext = React.createContext<MessageInstance | null>(null);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message API
export const useMessage = () => {
  const messageApi = React.useContext(MessageContext);
  if (!messageApi) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return messageApi;
};
