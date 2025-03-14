// import { create } from 'zustand';
// import { School, schoolApi } from '@/services/schoolApi';

// interface SchoolStore {
//   schools: School[];
//   currentSchool: School | null;
//   isLoading: boolean;
//   error: string | null;
  
//   fetchSchools: () => Promise<void>;
//   fetchSchool: (id: number) => Promise<void>;
//   createSchool: (school: Omit<School, 'id'>) => Promise<void>;
//   updateSchool: (id: number, school: Partial<School>) => Promise<void>;
//   deleteSchool: (id: number) => Promise<void>;
// }

// export const useSchoolStore = create<SchoolStore>((set) => ({
//   schools: [],
//   currentSchool: null,
//   isLoading: false,
//   error: null,

//   fetchSchools: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       const schools = await schoolApi.getAll();
//       set({ schools, isLoading: false });
//     } catch (error) {
//       set({ error: 'Failed to fetch schools', isLoading: false });
//     }
//   },

//   fetchSchool: async (id: number) => {
//     set({ isLoading: true, error: null });
//     try {
//       const school = await schoolApi.getById(id);
//       set({ currentSchool: school, isLoading: false });
//     } catch (error) {
//       set({ error: 'Failed to fetch school', isLoading: false });
//     }
//   },

//   createSchool: async (school: Omit<School, 'id'>) => {
//     set({ isLoading: true, error: null });
//     try {
//       const newSchool = await schoolApi.create(school);
//       set((state) => ({ 
//         schools: [...state.schools, newSchool],
//         isLoading: false 
//       }));
//     } catch (error) {
//       set({ error: 'Failed to create school', isLoading: false });
//     }
//   },

//   updateSchool: async (id: number, school: Partial<School>) => {
//     set({ isLoading: true, error: null });
//     try {
//       const updatedSchool = await schoolApi.update(id, school);
//       set((state) => ({
//         schools: state.schools.map(s => s.id === id ? updatedSchool : s),
//         currentSchool: updatedSchool,
//         isLoading: false
//       }));
//     } catch (error) {
//       set({ error: 'Failed to update school', isLoading: false });
//     }
//   },

//   deleteSchool: async (id: number) => {
//     set({ isLoading: true, error: null });
//     try {
//       await schoolApi.delete(id);
//       set((state) => ({
//         schools: state.schools.filter(s => s.id !== id),
//         isLoading: false
//       }));
//     } catch (error) {
//       set({ error: 'Failed to delete school', isLoading: false });
//     }
//   },
// }));
