"use client";

import { useEffect, useState } from "react";
import BorrowTable from "../../components/borrowTable/BorrowTable";
import { useRouter } from "next/navigation";

export default function BorrowBookPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mượn sách</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BorrowTable />
        <p className="text-gray-600">Chức năng đang được phát triển...</p>
      </div>
    </div>
  );
}
