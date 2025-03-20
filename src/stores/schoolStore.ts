import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SchoolState, School } from "../types/schema";
import { schoolService } from "../services/schoolService";
import { useAuthStore } from "./authStore";
import { debounce } from "lodash";

const resetSelectedSchoolId = () => {
  const { setSelectedSchoolId } = useAuthStore.getState();
  setSelectedSchoolId("");
};

const setSelectedSchoolId = (schoolId: string) => {
  const { setSelectedSchoolId } = useAuthStore.getState();
  setSelectedSchoolId(schoolId);
};

const debouncedSearch = debounce(
  async (
    doetCode: string,
    divisionCode: string | null,
    keyword: string,
    set: (state: Partial<SchoolState>) => void
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
  500
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
      isLoading: false,

      setUnitLevel: (level) => {
        set({ unitLevel: level, schoolList: [] });
        resetSelectedSchoolId();

        if (level === "02") {
          get().fetchSoList();
          const { selectedSo, soList } = get();
          const selectedSoData = soList.find(
            (s) => s.doetCode === selectedSo
          )?.id;
          setSelectedSchoolId(selectedSoData?.toString() || "");
        }
        if (level === "03") {
          get().fetchSoList();
          const { selectedSo, soList } = get();
          if (selectedSo) {
            get().fetchPhongList(selectedSo);
            const selectedSoData = soList.find(
              (s) => s.doetCode === selectedSo
            )?.id;
            setSelectedSchoolId(selectedSoData?.toString() || "");
          }
        }
        if (level === "04") {
          get().fetchSoList();
          const { selectedSo } = get();
          if (selectedSo) {
            get().fetchPhongList(selectedSo);
            get().fetchSchoolList(selectedSo, null, 0);
            const { selectedSchool } = get();
            setSelectedSchoolId(selectedSchool?.[0]?.id.toString() || "");
          }
        }
        if (level === "05") {
          get().fetchPartnerList();
          resetSelectedSchoolId();
        }
      },

      setSelectedSo: (so) => {
        set({
          selectedSo: so,
          selectedPhong: null,
          schoolList: [],
        });
        if (so) {
          get().fetchPhongList(so);
          get().fetchSchoolList(so, null, 0);
        }
      },

      setSelectedPhong: (phong) => {
        set({ selectedPhong: phong, schoolList: [] });
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

          const selectedSchools = get().selectedSchool || [];
          const responseData = response.data || [];

          // Filter out schools that are already in response.data
          const uniqueSelectedSchools = selectedSchools.filter(
            (selected) =>
              !responseData.some((school) => school.id === selected.id)
          );

          set({
            schoolList: [
              ...uniqueSelectedSchools,
              ...(skip === 0
                ? responseData
                : [...(get().schoolList || []), ...responseData]),
            ],
          });
        } catch (error) {
          console.error("Error fetching school list:", error);
          if (skip === 0) {
            set({ schoolList: [...(get().selectedSchool || [])] });
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
          });
        } catch (error) {
          console.error("Error fetching partner list:", error);
          set({ schoolList: [] });
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
        keyword: string | ""
      ) => {
        set({ isLoading: true });
        debouncedSearch(doetCode, divisionCode, keyword, set);
      },

      setSelectedSchool: (schools: School[]) => {
        set({ selectedSchool: schools });
      },

      fetchSchoolOptions: async (
        selectedSo,
        selectedPhong,
        searchValue,
        existingIds
      ) => {
        if (!selectedSo) return [];

        try {
          const response = await schoolService.searchSchools(
            selectedSo,
            selectedPhong,
            searchValue
          );

          return (response.data || [])
            .filter((school) => !existingIds.has(school.id.toString()))
            .map((school) => ({
              key: `search_${school.id}`,
              value: school.id.toString(), // Make sure this matches the expected format
              label: school.name, // Make sure this matches the expected format
            }));
        } catch (error) {
          console.error("Error fetching school options:", error);
          return [];
        }
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
