import apiClient from "./apiClient";
import { BookCatalogParams, BookCatalog } from "@/types/schema";

export const bookService = {
  getBookCatalog: async (params: BookCatalogParams): Promise<BookCatalog[]> => {
    try {
      const response = await apiClient.get("/book-catalog", {
        params,
      });
      console.log("Book catalog response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching book catalog:", error);
      return [];
    }
  },
};
