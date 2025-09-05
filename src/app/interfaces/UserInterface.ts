export interface User {
  id: string;
  name: string;
  password: string;
  email: string;
  avatar?: string;
  isActive?: boolean;
  status?: string;
}
