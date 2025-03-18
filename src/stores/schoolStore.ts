import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchoolState, School } from "../types/schema";
import { schoolService } from "../services/schoolService";
import { debounce } from "lodash";

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      unitLevel: undefined,
      selectedSo: null,
      selectedPhong: null,
      selectedSchool: null,
      soList: [],
      phongList: [],
      schoolList: [],
      isLoading: false,

      setUnitLevel: (level) => {
        set({ unitLevel: level });
        if (level === "02" || level === "03" || level === "04") {
          get().fetchSoList();
        }
        if (level === "05") {
          get().fetchPartnerList();
        }
      },

      setSelectedSo: (so) => {
        set({ selectedSo: so, selectedPhong: null });
        if (so) {
          get().fetchPhongList(so);
          get().fetchSchoolList(so, null);
        }
      },

      setSelectedPhong: (phong) => {
        set({ selectedPhong: phong });
        const { selectedSo } = get();
        if (selectedSo) {
          get().fetchSchoolList(selectedSo, phong);
        }
      },

      fetchSoList: async () => {
        set({ isLoading: true });
        try {
          const soList = await schoolService.fetchSoList();
          set({ soList });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPhongList: async (doetCode) => {
        set({ isLoading: true });
        try {
          const phongList = await schoolService.fetchPhongList(doetCode);
          set({ phongList });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchSchoolList: async (doetCode, divisionCode, skip = 0, take = 50) => {
        set({ isLoading: true });
        try {
          const response = await schoolService.fetchSchoolList(
            doetCode,
            divisionCode,
            skip,
            take
          );
          set({ schoolList: response.data });
          return response;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPartnerList: async () => {
        set({ isLoading: true });
        try {
          const partnerList = await schoolService.fetchPartnerList();
          set({ schoolList: partnerList });
        } finally {
          set({ isLoading: false });
        }
      },

      searchSchools: debounce(async (keyword) => {
        const { selectedSo, selectedPhong } = get();
        if (!selectedSo) return;

        set({ isLoading: true });
        try {
          const schools = await schoolService.searchSchools(
            selectedSo,
            selectedPhong,
            keyword
          );
          set({ schoolList: schools });
        } finally {
          set({ isLoading: false });
        }
      }, 500) as (keyword: string) => Promise<void>,
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
