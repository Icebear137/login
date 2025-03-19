import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchoolState, School } from "../types/schema";
import { schoolService } from "../services/schoolService";
import { debounce } from "lodash";

const debouncedSearch = debounce(
  async (
    doetCode: string,
    divisionCode: string | null,
    keyword: string,
    set: any
  ) => {
    try {
      const response = await schoolService.searchSchools(
        doetCode,
        divisionCode,
        keyword
      );
      set({
        schoolList: response.data || [],
      });
    } catch (error) {
      console.error("Error searching schools:", error);
      set({ schoolList: [] });
    }
  },
  300
);

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      unitLevel: undefined,
      selectedSo: null,
      selectedPhong: null,
      selectedSchool: [],
      soList: [],
      phongList: [],
      schoolList: [],
      totalSchools: 0,
      isLoading: false,

      setUnitLevel: (level) => {
        set({ unitLevel: level, schoolList: [], totalSchools: 0 });
        if (level === "02" || level === "03" || level === "04") {
          get().fetchSoList();
          const { selectedSo, selectedSchool } = get();
          if (selectedSo) {
            get().fetchPhongList(selectedSo);
            get().fetchSchoolList(selectedSo, null, 0);
          }
          if (selectedSchool) {
            get().setSelectedSchool(selectedSchool);
          }
        }
        if (level === "05") {
          get().fetchPartnerList();
        }
      },

      setSelectedSo: (so) => {
        set({
          selectedSo: so,
          selectedPhong: null,
          schoolList: [],
          totalSchools: 0,
        });
        if (so) {
          get().fetchPhongList(so);
          get().fetchSchoolList(so, null, 0);
        }
      },

      setSelectedPhong: (phong) => {
        set({ selectedPhong: phong, schoolList: [], totalSchools: 0 });
        const { selectedSo } = get();
        if (selectedSo) {
          get().fetchSchoolList(selectedSo, phong, 0);
        }
      },

      fetchSoList: async () => {
        set({ isLoading: true });
        try {
          const response = await schoolService.fetchSoList();
          set({ soList: response.data || [] });
        } catch (error) {
          console.error("Error fetching So list:", error);
          set({ soList: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPhongList: async (doetCode) => {
        set({ isLoading: true });
        try {
          const phongList = await schoolService.fetchPhongList(doetCode);
          set({ phongList: phongList.data || [] });
        } catch (error) {
          console.error("Error fetching Phong list:", error);
          set({ phongList: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchSchoolList: async (
        doetCode: string | null,
        divisionCode: string | null,
        skip = 0,
        take = 50
      ) => {
        if (!doetCode) return;

        set({ isLoading: true });
        try {
          const response = await schoolService.fetchSchoolList(
            doetCode,
            divisionCode,
            skip,
            take
          );

          set({
            schoolList:
              skip === 0
                ? response.data || []
                : [...get().schoolList, ...(response.data || [])],
            totalSchools: response.total || 0,
          });
        } catch (error) {
          console.error("Error fetching school list:", error);
          if (skip === 0) {
            set({ schoolList: [], totalSchools: 0 });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPartnerList: async () => {
        set({ isLoading: true });
        try {
          const response = await schoolService.fetchPartnerList();
          set({
            schoolList: response.data || [],
            totalSchools: response.total || 0,
          });
        } catch (error) {
          console.error("Error fetching partner list:", error);
          set({ schoolList: [], totalSchools: 0 });
        } finally {
          set({ isLoading: false });
        }
      },

      searchSchools: async (doetCode, divisionCode, keyword) => {
        set({ isLoading: true });
        try {
          const response = await schoolService.searchSchools(
            doetCode,
            divisionCode,
            keyword
          );
          set({
            schoolList: response.data || [],
          });
        } catch (error) {
          console.error("Error searching schools:", error);
          set({ schoolList: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      debouncedSearch: (
        doetCode: string,
        divisionCode: string | null,
        keyword: string
      ) => {
        set({ isLoading: true });
        debouncedSearch(doetCode, divisionCode, keyword, set);
      },

      setSelectedSchool: (schools: School[]) => {
        set({ selectedSchool: schools });
      },
    }),
    {
      name: "school-store",
      partialize: (state) => ({
        unitLevel: state.unitLevel,
        selectedSo: state.selectedSo,
        selectedSchool: state.selectedSchool,
      }),
    }
  )
);
