import apiClient from "./apiClient";
import { BorrowParams, BookObject, BorrowRequest } from "@/types/schema";

export const borrowService = {
  getBorrowRecords: async (params: BorrowParams) => {
    const response = await apiClient.get("/loan-record", {
      params,
    });
    return response.data.data;
  },
  getBookRecords: async (obj: BookObject) => {
    const response = await apiClient.post("/book/get-borrowed", obj);
    return response.data.data;
  },
  getLoanDetailById: async (id: number) => {
    const response = await apiClient.get(
      `/loan-record/find-by-code-and-type/1/${id}`
    );
    return response.data.data;
  },
  getLoanCode: async () => {
    const response = await apiClient.get(
      "/loan-record/genarate-loan-code-by-type/1"
    );
    return response.data;
  },
  sendBorrowRequest: async (request: BorrowRequest) => {
    const response = await apiClient.post("/loan-record/borrow", request);
    return response.data;
  },
};
