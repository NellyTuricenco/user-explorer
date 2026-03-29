export interface Address {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Company {
  department: string;
  name: string;
  title: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  age: number;
  gender: 'male' | 'female' | string;
  role?: 'admin' | 'moderator' | 'user' | string;
  phone: string;
  image: string;
  address: Address;
  company: Company;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  age: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender: string;
  image: string;
}

export interface ValidationErrors {
  [key: string]: string;
}
