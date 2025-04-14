import apiClient from "./apiClient";
import {
  StudentParams,
  Student,
  GradeCode,
  SchoolClassResponse,
  TeacherGroupSubject,
} from "@/types/schema";

interface StudentResponse {
  items: Student[];
  total: number;
}

export const studentService = {
  getStudentRecords: async (
    params: StudentParams
  ): Promise<Student[] | StudentResponse> => {
    const response = await apiClient.get("/library-card", {
      params,
    });
    // Handle both array and object responses
    return response.data.data;
  },
  getStudentById: async (id: string): Promise<Student> => {
    const response = await apiClient.get(`/library-card/${id}`);
    return response.data.data;
  },

  getStudentByCardNumber: async (cardNumber: string): Promise<Student> => {
    const response = await apiClient.get(
      `/library-card/find-by-card-number/${cardNumber}`
    );
    return response.data.data;
  },
  getGradeCodes: async (): Promise<GradeCode[]> => {
    const response = await apiClient.get("/master-data/grade/list");
    return response.data.data;
  },
  getSchoolClasses: async (
    gradeCode?: string
  ): Promise<SchoolClassResponse> => {
    const params = {
      year: "2024",
      ...(gradeCode ? { gradeCode } : {}),
    };
    const response = await apiClient.get(`/school-class`, {
      params,
    });
    return response.data.data;
  },
  getTeacherGroupSubjects: async (): Promise<TeacherGroupSubject[]> => {
    try {
      const response = await apiClient.get(
        "master-data/teacher-group-subject/list"
      );

      // Ensure we return an array
      const data = response.data.data || [];
      return data;
    } catch (error) {
      console.error("Error fetching teacher group subjects:", error);
      return [];
    }
  },
};
