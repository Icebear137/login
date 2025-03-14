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

export interface SelectOption {
  value: string;
  label: string;
}
