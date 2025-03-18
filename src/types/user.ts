export interface UserInfo {
  id: string;
  username: string;
  email: string;
  [key: string]: any; // for other potential fields from API
}
