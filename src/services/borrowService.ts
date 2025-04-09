import apiClient from "./apiClient";
import { BorrowParams, BookObject } from "@/types/schema";

export const borrowService = {
  getBorrowRecords: async (params: BorrowParams) => {
    const response = await apiClient.get("/loan-record", {
      params,
    });
    return response.data.data;
  },
  getBookRecords: async (obj: BookObject) => {
    const response = await apiClient.post("/book/get-borrowed", obj);
    console.log(response.data.data);
    return response.data.data;
  },
};
