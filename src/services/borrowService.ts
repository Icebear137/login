import apiClient from "./apiClient";

interface BorrowParams {
  skip: number;
  take: number;
  searchKey?: string;
  fromDate?: string;
  toDate?: string;
  cardType?: number;
  loanStatus?: string;
  sortBy?: string;
  sortDirection?: string;
}

interface BookObject {
  searchKey: string;
  fromDate: string;
  toDate: string;
  cardType?: number;
  loanStatus: string;
  sortBy: string;
  sortDirection: string;
  registrationNumber: string;
  title: string;
}

export const borrowService = {
  getBorrowRecords: async (params: BorrowParams) => {
    const response = await apiClient.get("/loan-record", {
      params,
    });
    return response.data;
  },
  getBookRecords: async (obj: BookObject) => {
    const response = await apiClient.post("book/get-borrowed", {
      obj,
    });
    return response.data;
  },
};
