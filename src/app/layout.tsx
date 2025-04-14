import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import { ReduxProvider } from "../redux/Provider";
import { ConfigProvider, App as AntdApp } from "antd";
import { MessageProvider } from "@/components/MessageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý mượn trả sách",
  description: "Hệ thống quản lý mượn trả sách thư viện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ConfigProvider>
            <AntdApp>
              <MessageProvider>{children}</MessageProvider>
            </AntdApp>
          </ConfigProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
