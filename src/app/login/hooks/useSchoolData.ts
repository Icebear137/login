import { useState, useCallback, useRef, useEffect } from "react";
import { School } from "../types";
import {
  fetchSoList,
  fetchPhongList,
  fetchSchoolList,
  searchSchools,
  fetchPartnerList,
} from "../api/schoolApi";
import debounce from "lodash/debounce";
import { set } from "lodash";

interface UseSchoolDataReturn {
  soList: School[];
  phong: School[];
  schools: School[];
  partners: School[];
  loading: boolean;
  hasMore: boolean;
  fetchSoList: () => Promise<void>;
  fetchPhongList: (doetCode: string) => Promise<void>;
  fetchSchoolList: (
    doetCode: string,
    divisionCode: string | null,
    reset?: boolean
  ) => Promise<void>;
  fetchPartnerList: () => Promise<void>;
  debouncedSearch: (value: string, doetCode: string) => void;
}

export function useSchoolData(): UseSchoolDataReturn {
  const [soList, setSoList] = useState<School[]>([]);
  const [phong, setPhong] = useState<School[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [partners, setPartners] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const skipCount = useRef(0);
  const searchQuery = useRef("");
  const LIMIT = 20;

  const fetchSoListData = useCallback(async () => {
    setLoading(true);
    const data = await fetchSoList();
    if (JSON.stringify(data.data) !== JSON.stringify(soList)) {
      setSoList(data.data || []);
    }
    setLoading(false);
  }, [soList]);

  const fetchPhongListData = useCallback(
    async (doetCode: string) => {
      setLoading(true);
      const data = await fetchPhongList(doetCode);
      if (JSON.stringify(data.data) !== JSON.stringify(phong)) {
        setPhong(data.data || []);
      }
      setLoading(false);
    },
    [phong]
  );

  const fetchPartnerListData = useCallback(async () => {
    setLoading(true);
    const data = await fetchPartnerList();
    console.log(data.data);
    setPartners(data.data || []);
    setLoading(false);
  }, []);

  const fetchSchoolListData = useCallback(
    async (doetCode: string, divisionCode: string | null, reset = false) => {
      if (!reset) {
        skipCount.current = 0;
        setSchools([]);
        setHasMore(true);
      }

      setLoading(true);
      const data = await fetchSchoolList(
        doetCode,
        divisionCode,
        skipCount.current,
        LIMIT
      );
      if (data.data?.length) {
        setSchools((prev) => (!reset ? data.data : [...prev, ...data.data]));
        setHasMore(data.data.length === LIMIT);
        skipCount.current += data.data.length;
      } else {
        setHasMore(false);
      }
      setLoading(false);
    },
    []
  );

  const debouncedSearch = useCallback(
    debounce(async (value: string, doetCode: string) => {
      searchQuery.current = value;
      setLoading(true);

      if (!value) {
        skipCount.current = 0;
        await fetchSchoolListData(doetCode, null, false);
        setLoading(false);
        return;
      }

      const data = await searchSchools(doetCode, value, LIMIT);
      if (data.data?.length) {
        setSchools(data.data);
        setHasMore(false);
      } else {
        setSchools([]);
        setHasMore(false);
      }
      setLoading(false);
    }, 500),
    [fetchSchoolListData]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // Cleanup debounced function on unmount
    };
  }, [debouncedSearch]);

  return {
    soList,
    phong,
    schools,
    partners,
    loading,
    hasMore,
    fetchSoList: fetchSoListData,
    fetchPhongList: fetchPhongListData,
    fetchSchoolList: fetchSchoolListData,
    fetchPartnerList: fetchPartnerListData,
    debouncedSearch,
  };
}
