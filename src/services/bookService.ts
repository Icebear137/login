import apiClient from "./apiClient";
import {
  BookCatalogParams,
  BookCatalog,
  BookType,
  BookRegistrationParams,
  BookRegistration,
} from "@/types/schema";

export const bookService = {
  getBookCatalog: async (params: BookCatalogParams): Promise<BookCatalog[]> => {
    try {
      const response = await apiClient.get("/book-catalog", {
        params,
      });

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching book catalog:", error);
      return [];
    }
  },
  getBookTypes: async (): Promise<BookType[]> => {
    try {
      const response = await apiClient.get("/book-type/combo");

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching book types:", error);
      return [];
    }
  },

  getBookRegistrations: async (
    params: BookRegistrationParams
  ): Promise<BookRegistration[]> => {
    try {
      const response = await apiClient.post("book/detail", params);

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching book registrations:", error);
      return [];
    }
  },
  getBookbyRegistrationNumber: async (obj: any) => {
    const response = await apiClient.post(`book/detail`, {
      obj,
    });
    return response.data.data;
  },
};
