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

export interface BorrowParams {
  skip: number;
  take: number;
  searchKey?: string;
  fromDate?: string;
  toDate?: string;
  cardType?: number;
  loanStatus?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface BookObject {
  searchKey: string;
  fromDate: string;
  toDate: string;
  cardType?: number;
  loanStatus: number;
  sortBy: string;
  sortDirection: string;
  registrationNumber: string;
  title: string;
}

export interface BorrowRecord {
  id: number;
  borrowId: string;
  cardNumber: string;
  name: string;
  class: string;
  type: string;
  borrowDate: string;
  returnDate: string;
  booksCount: number;
  returned: number;
  lost: number;
}

export interface BookRecord {
  id: number;
  key?: string;
  stt?: number;
  registrationNumber: string;
  loanCode: string;
  title: string;
  authors: string;
  publishingCompany: string;
  publishYear: string;
  cardNumber: string;
  fullName: string;
  class: string;
  cardType: string;
  borrowDate: string;
  expiredDate: string;
  status: string;
}

export interface BorrowState {
  // Using any[] because records can be either ApiRecord[] or ApiBookRecord[] depending on the view mode
  records: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    searchKey: string;
    fromDate: string;
    toDate: string;
    cardType?: number | null;
    loanStatus?: number | null;
    isReturn?: boolean | null;
    sortBy?: string | null;
    sortDirection?: boolean | null;
    registrationNumber: string;
    title: string;
  };
}

export interface ApiRecord {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  totalBorrowing: number;
  totalLoan: number;
  totalLost: number;
  totalReturn: number;
  loanCode: string;
  fullName: string;
  avatar: string;
  cardTypeId: number;
  cardExpiredDate: string;
  cardStatus: number;
  expiredDate: string;
  cardTypeName: string;
  cardNumber: string;
  cardId: number;
  loanDate: string;
  lenderName: string;
  receiverName: string;
  loanType: number;
  loanStatus: number;
  notes: string;
  schoolClassName: string;
  teacherGroupSubjectName: string;
  books: ApiBookRecord[];
}

export interface ApiBookRecord {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  bookCatalogId: number;
  bookDocumentEntryId: number;
  registrationNumber: string;
  registrationDate: string;
  registrationEntryDate: string;
  bookConditionId: number;
  bookStatusId: number;
  numberOfBorrow: number;
  notes: string;
  managementCode: string;
  pricingCode: string;
  textbookRegistrationNumber: string;
  textbookPrefix: string;
  maxRegistrationNumber: number;
  bookTypeId: number;
  bookTypeCode: string;
  bookTypeName: string;
  title: string;
  thumbsUrl: string;
  parallelTitle: string;
  shortTitle: string;
  authors: string;
  otherAuthors: string;
  languageId: number;
  languageCode: string;
  languageName: string;
  schoolPublishingCompanyId: number;
  schoolPublishingCompanyCode: string;
  schoolPublishingCompanyName: string;
  publishYear: number;
  publishingLocationName: string;
  editionNumber: number;
  numberOfPages: number;
  coverPrice: number;
  referencePrice: number;
  bookSize: string;
  isbn: string;
  schoolBookCategoryId: number;
  schoolBookCategoryCode: string;
  schoolBookCategoryName: string;
  schoolPublicationTypeId: number;
  schoolPublicationTypeCode: string;
  schoolPublicationTypeName: string;
  authorSymbol: string;
  titleSymbol: string;
  collectionSeries: string;
  annotation: string;
  schoolCategoryId: number;
  schoolCategoryCode: string;
  schoolCategoryName: string;
  compiler: string;
  chiefEditor: string;
  translator: string;
  proofreader: string;
  isNew: number;
  documentNumber: string;
  financialContractNumber: string;
  documentDate: string;
  supplierName: string;
  loanCode: string;
  loanReturnCode: string;
  loanDate: string;
  loanReturnDate: string;
  loanReturnType: number;
  loanExpiredDate: string;
  lenderName: string;
  receiverName: string;
  cardId: number;
  cardNumber: string;
  isReturn: boolean;
  isReturnName: string;
  amount: number;
  returnNotes: string;
  cardTypeId: number;
  cardTypeName: string;
  fullName: string;
  schoolClassName: string;
  teacherGroupSubjectName: string;
  loanRecordDetailId: number;
}

export interface BookViewRecord {
  id: number;
  key?: string;
  stt?: number;
  registrationNumber: string;
  loanCode: string;
  title: string;
  authors: string;
  publishingCompany: string;
  publishYear: number;
  cardNumber: string;
  fullName: string;
  cardType: string;
  class: string;
  loanDate: string;
  expiredDate: string;
  returnDate: string;
  status: string;
}

export interface FlatBookRecord {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  bookCatalogId: number;
  bookDocumentEntryId: number;
  registrationNumber: string;
  registrationDate: string;
  registrationEntryDate: string;
  bookConditionId: number;
  bookStatusId: number;
  numberOfBorrow: number;
  notes: string;
  managementCode: string;
  pricingCode: string;
  textbookRegistrationNumber: string;
  textbookPrefix: string;
  maxRegistrationNumber: number;
  bookTypeId: number;
  bookTypeCode: string;
  bookTypeName: string;
  title: string;
  thumbsUrl: string;
  parallelTitle: string;
  shortTitle: string;
  authors: string;
  otherAuthors: string;
  languageId: number;
  languageCode: string;
  languageName: string;
  schoolPublishingCompanyId: number;
  schoolPublishingCompanyCode: string;
  schoolPublishingCompanyName: string;
  publishYear: number;
  publishingLocationName: string;
  editionNumber: number;
  numberOfPages: number;
  coverPrice: number;
  referencePrice: number;
  bookSize: string;
  isbn: string;
  schoolBookCategoryId: number;
  schoolBookCategoryCode: string;
  schoolBookCategoryName: string;
  schoolPublicationTypeId: number;
  schoolPublicationTypeCode: string;
  schoolPublicationTypeName: string;
  authorSymbol: string;
  titleSymbol: string;
  collectionSeries: string;
  annotation: string;
  schoolCategoryId: number;
  schoolCategoryCode: string;
  schoolCategoryName: string;
  compiler: string;
  chiefEditor: string;
  translator: string;
  proofreader: string;
  isNew: number;
  documentNumber: string;
  financialContractNumber: string;
  documentDate: string;
  supplierName: string;
  loanCode: string;
  loanReturnCode: string;
  loanDate: string;
  loanReturnDate: string;
  loanReturnType: number;
  loanExpiredDate: string;
  lenderName: string;
  receiverName: string;
  cardId: number;
  cardNumber: string;
  isReturn: boolean;
  isReturnName: string;
  amount: number;
  returnNotes: string;
  cardTypeId: number;
  cardTypeName: string;
  fullName: string;
  schoolClassName: string;
  teacherGroupSubjectName: string;
  loanRecordDetailId: number;
}
