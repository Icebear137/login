import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoanCardConfig {
  cardTypeId: number;
  quantityBorrow: number;
  quantityBorrowPerLoan: number;
  maxTimeBorrow: number;
  loanType: number;
  cardTypeName: string;
  id: number;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface SchoolInfo {
  id: number;
  doetCode: string;
  divisionCode: string;
  schoolCode: string;
  groupUnitCode: string;
  schoolLevel: number;
  doetName: string;
  divisionName: string;
  name: string;
  shortName: string;
  website: string;
  domainUrl: string;
  interactiveWebViewUrl: string;
  logo: string;
  phone: string;
  email: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  address: string;
  principal: string;
  principalPhone: string;
  principalEmail: string;
  schoolType: string;
  status: number;
  isInitedData: number;
  initedTime: string | null;
  useBookStoreMinhViet: number;
  activedTime: string;
  allowHoChiMinhCulturalSpace: boolean;
  fax: string | null;
  location: string;
  lat: string;
  lng: string;
  loginToRead: number;
  quote: string;
  linkFacebook: string;
  linkYoutube: string;
  linkInstagram: string;
  linkTiktok: string;
  linkZalo: string;
  managementOrganization: string;
  convertStatus: number;
  viewBookByBookType: number;
  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;
  themeConfig: any | null;
  isPrimarySchool: boolean;
  schoolLevels: any[];
  libraryAdminName: string;
  libraryAdminMaster: string;
  loanCardConfigs: LoanCardConfig[];
  schoolYearConfig: any;
}

interface UserInfo {
  id: number;
  accountCode: string;
  doetCode: string;
  divisionCode: string;
  schoolCode: string;
  groupUnitCode: string;
  schoolLevel: number;
  userName: string;
  fullName: string;
  firstName: string;
  lastName: string;
  gender: number;
  email: string;
  phone: string;
  avatar: string;
  isTeacher: number;
  schoolClass: any | null;
  schoolInfos: SchoolInfo[];
  isPrimarySchool: boolean;
}

interface UserState {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserInfo: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserInfoSuccess: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchUserInfoFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUserInfo, fetchUserInfoSuccess, fetchUserInfoFailure } =
  userSlice.actions;

export default userSlice.reducer;
