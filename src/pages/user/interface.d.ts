export interface IUser {
  id: number;
  name: string;
  email: string | null;
  mobile_number: string;
  role: string;
  created_date: Date;
  avatar: string;
  bio: string;
  whatsapp_number: string;
  password?: string;
}
