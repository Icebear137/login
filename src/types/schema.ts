import { skip } from "node:test";

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
  login: () => Promise<boolean>; // Changed return type to boolean
  logout: () => void;
}

export interface SchoolState {
  unitLevel: string | undefined;
  selectedSo: string | null;
  selectedPhong: string | null;
  selectedSchool: string | null;
  soList: School[];
  phongList: School[];
  schoolList: School[];
  isLoading: boolean;
  setUnitLevel: (level: string | undefined) => void;
  setSelectedSo: (so: string | null) => void;
  setSelectedPhong: (phong: string | null) => void;
  fetchSoList: () => Promise<void>;
  fetchPartnerList: () => Promise<void>;
  fetchPhongList: (doetCode: string) => Promise<void>;
  fetchSchoolList: (
    doetCode: string,
    divisionCode: string | null,
    skip?: number,
    take?: number
  ) => Promise<void>;
  searchSchools: (keyword: string) => Promise<void>;
}
