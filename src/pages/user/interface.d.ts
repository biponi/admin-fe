export interface Permission {
  page: string;
  actions: string[];
}
export interface IUser {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  role: string;
  role_id: string;
  permissions: Permission[];
  created_date: string | Date;
  avatar?: string;
  bio?: string;
  whatsapp_number?: string;
  password?: string;
}
