import { useState, useCallback, useRef } from 'react';
import { School } from '../types';
import { fetchSoList, fetchPhongList, fetchSchoolList, searchSchools } from '../api/schoolApi';
import debounce from 'lodash/debounce';

export function useSchoolData() {
  const [soList, setSoList] = useState<School[]>([]);
  const [phong, setPhong] = useState<School[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const skipCount = useRef(0);
  const searchQuery = useRef('');
  const LIMIT = 20;

  const fetchSoListData = useCallback(async () => {
    setLoading(true);
    const data = await fetchSoList();
    setSoList(data.data || []);
    setLoading(false);
  }, []);

  const fetchPhongListData = useCallback(async (doetCode: string) => {
    setLoading(true);
    const data = await fetchPhongList(doetCode);
    setPhong(data.data || []);
    setLoading(false);
  }, []);

  const fetchSchoolListData = useCallback(async (doetCode: string, divisionCode: string | null, reset = false) => {
    if (reset) {
      skipCount.current = 0;
      // setSchools([]);
      setHasMore(true);
    }

    if (!searchQuery.current) {
      setLoading(true);
      const data = await fetchSchoolList(doetCode, divisionCode, skipCount.current, LIMIT);
      if (data.data?.length) {
        setSchools(prev => [...prev, ...data.data]);
        setHasMore(data.data.length === LIMIT);
        skipCount.current += data.data.length;
      } else {
        setHasMore(false);
      }
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (value: string, doetCode: string) => {
      searchQuery.current = value;
      setLoading(true);
      
      if (!value) {
        skipCount.current = 0;
        await fetchSchoolListData(doetCode, null, true);
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
    []
  );

  return {
    soList,
    phong,
    schools,
    loading,
    hasMore,
    fetchSoList: fetchSoListData,
    fetchPhongList: fetchPhongListData,
    fetchSchoolList: fetchSchoolListData,
    debouncedSearch
  };
}
