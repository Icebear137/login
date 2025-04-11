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

export interface LoanDetail {
  id: number;
  loanCode: string;
  loanDate: string;
  expiredDate: string;
  note: string;
  cardNumber: string;
  fullName: string;
  schoolClassName?: string;
  teacherGroupSubjectName?: string;
  cardTypeName: string;
  books: {
    id: number;
    registrationNumber: string;
    title: string;
    authors: string;
    isbn: string;
    publishYear: number;
    schoolPublishingCompanyName: string;
    isReturn: boolean;
    returnDate?: string;
    isLost: boolean;
    lostDate?: string;
  }[];
}

export interface LoanCodeResponse {
  code: string;
  data: string;
  message: string;
}

export interface BorrowState {
  // Using any[] because records can be either ApiRecord[] or ApiBookRecord[] depending on the view mode
  records: any[];
  loading: boolean;
  error: string | null;
  selectedLoan: LoanDetail | null;
  loanCode: string;
  loadingLoanCode: boolean;
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

export interface BookRegister {
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
  bookRegisterId: number;
  cardNumber: string;
  cardId: number;
  cardType: number;
  fullName: string;
  dateRegister: string;
  gender: number;
  schoolClassName: string;
  teacherGroupSubjectName: string;
  dateOfBirth: string;
}

export interface Student {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  cardNumber: string;
  cardTypeId: number;
  cardStatus: number;
  userCode: string;
  fullName: string;
  lastName: string;
  firstName: string;
  gender: number;
  avatar: string;
  issueDate: string;
  startDate: string;
  expireDate: string;
  totalBorrowedBooks: number;
  totalBorrowingBooks: number;
  totalReturnBooks: number;
  schoolClassName: string;
  teacherGroupSubjectName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  schoolYears: string;
  isUsing: number;
  bookRegisters?: BookRegister[];
}

export interface StudentParams {
  skip: number;
  take: number;
  searchKey?: string;
  cardTypeId?: number;
  cardStatus?: number;
  sortBy?: string;
  sortDirection?: string;
  cardNumber?: string;
  gradeCode?: string;
  schoolClassId?: number;
  isNotExpired?: number;
  teacherGroupSubjectId?: number | null;
}

export interface GradeCode {
  id: number;
  code: number;
  schoolLevel: number;
  name: string;
  order: number;
}

export interface SchoolClass {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  year: number;
  schoolYear: string;
  schoolLevel: number;
  gradeCode: string;
  name: string;
  status: number;
  order: number;
  totalStudents: number;
  idMoet: number;
}

export interface SchoolClassResponse {
  data: SchoolClass[];
  totalCount: number;
}

export interface TeacherGroupSubject {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  order: number;
  status: number;
}

export interface Book {
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
}

export interface BookCatalog {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  code: string;
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
  bookTypeId: number;
  bookTypeCode: string;
  bookTypeName: string;
  schoolBookCategoryId: number;
  schoolBookCategoryCode: string;
  schoolBookCategoryName: string;
  schoolPublicationTypeId: number;
  schoolPublicationTypeCode: string;
  schoolPublicationTypeName: string;
  authorSymbol: string;
  titleSymbol: string;
  notes: string;
  collectionSeries: string;
  annotation: string;
  keywords: string;
  summary: string;
  introduction: string;
  schoolCategoryId: number;
  schoolCategoryCode: string;
  schoolCategoryName: string;
  isCatalog: number;
  isUniqueRegistration: number;
  compiler: string;
  chiefEditor: string;
  translator: string;
  additionalInfo: string;
  proofreader: string;
  secondaryKeywords: string;
  geographicKeywords: string;
  characterKeywords: string;
  isNew: number;
  books: Book[];
  totalBooks: number;
  totalBooksBorrowed: number;
  totalBooksAvailable: number;
  gradeCode: number;
  gradeName: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  maxTextbookRegistrationNumber: number;
}

export interface BookCatalogParams {
  schoolPublishingCompanyId?: number;
  languageId?: number;
  bookTypeId?: number;
  myBookTypeId?: number;
  schoolBookCategoryId?: number;
  schoolCategoryId?: number;
  fromDate?: string;
  toDate?: string;
  isGetBookAvailable?: boolean;
  searchKey?: string;
  skip?: number;
  take?: number;
}

export interface BookType {
  id: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  parentId: number;
  status: number;
  order: number;
  isSystem: number;
  parentName: string;
  rootCode: string;
  groupUnitCode: string;
  schoolCode: string;
  doetCode: string;
  divisionCode: string;
}

export interface BookRegistrationParams {
  searchKey?: string;
  skip?: number;
  take?: number;
  bookTypeId?: number;
  bookConditionId?: number | null;
  bookStatusId?: number;
  documentNumber?: string;
  registrationEntryDate?: string;
  registrationDate?: string;
  registrationEntryFrom?: string;
  registrationEntryTo?: string;
  registrationFrom?: string;
  registrationTo?: string;
  documentDate?: string;
  registrationNumberFrom?: number;
  registrationNumberTo?: number;
  registrationNumber?: string;
  registrationNumbers?: string;
  bookCatalogIds?: number[];
  bookDocumentEntryId?: number;
  isLost?: boolean;
  sortBy?: string;
  sortDirection?: boolean;
  schoolCategoryId?: number;
}

export interface BookRegistration {
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
}

export interface BookState {
  bookCatalogs: BookCatalog[];
  bookTypes: BookType[];
  bookRegistrations: BookRegistration[];
  loadingBookTypes: boolean;
  loadingBookRegistrations: boolean;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  registrationPagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    searchKey: string;
    schoolPublishingCompanyId?: number | null;
    languageId?: number | null;
    bookTypeId?: number | null;
    schoolBookCategoryId?: number | null;
    schoolCategoryId?: number | null;
    fromDate?: string | null;
    toDate?: string | null;
    isGetBookAvailable?: boolean | null;
  };
  registrationFilters: BookRegistrationParams;
}

export interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: {
    searchKey: string;
    cardTypeId?: number | null;
    cardStatus?: number | null;
    teacherGroupSubjectId?: number | null;
    isNotExpired?: number | null;
    cardNumber?: string | null;
    gradeCode?: string | null;
    schoolClassId?: number | null;
  };
  gradeCodes: GradeCode[];
  schoolClasses: SchoolClass[];
  teacherGroupSubjects: TeacherGroupSubject[];
  loadingGradeCodes: boolean;
  loadingSchoolClasses: boolean;
  loadingTeacherGroupSubjects: boolean;
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
