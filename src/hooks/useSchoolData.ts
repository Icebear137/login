import { useState } from "react";
import { School, SchoolOption } from "../types/schema";

export const useSchoolData = () => {
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);

  return {
    skip,
    setSkip,
    hasMore,
    setHasMore,
    allSchools,
    setAllSchools,
    schoolOptions,
    setSchoolOptions,
  };
};
