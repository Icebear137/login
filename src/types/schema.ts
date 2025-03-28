export interface School {
  id: number;
  name: string;
  groupUnitCode: string;
  doetCode?: string;
  divisionCode?: string;
  schoolCode?: string;
}

export interface LoginParams {
  userName: string;
  password: string;
  schoolId: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string;
  password: string;
  selectedSchoolId: string | null;
  isLoading: boolean;
  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
  setSelectedSchoolId: (schoolId: string | null) => void;
  login: () => Promise<boolean>;
  logout: () => void;
}

export interface SchoolState {
  unitLevel: string | undefined;
  selectedSo: string | null;
  selectedPhong: string | null;
  selectedSchool: School[] | null;
  soList: School[];
  phongList: School[];
  schoolList: School[];
  isLoading: boolean;
  setUnitLevel: (level: string | undefined) => void;
  setSelectedSo: (so: string | null) => void;
  setSelectedPhong: (phong: string | null) => void;
  setSelectedSchool: (school: School[]) => void;
  fetchSoList: () => Promise<void>;
  fetchPartnerList: () => Promise<void>;
  fetchPhongList: (doetCode: string) => Promise<void>;
  fetchSchoolList: (
    doetCode: string | null,
    divisionCode: string | null,
    skip?: number,
    take?: number
  ) => Promise<void>;
  searchSchools: (
    doetCode: string | null,
    divisionCode: string | null,
    keyword: string
  ) => void;
  fetchSchoolOptions: (
    selectedSo: string,
    selectedPhong: string,
    searchValue: string,
    existingIds: Set<string>
  ) => Promise<SchoolOption[]>;
}

export interface SchoolOption {
  key?: string;
  value: string;
  label: string;
}
