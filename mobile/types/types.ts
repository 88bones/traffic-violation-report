export interface User {
  name: string;
  email: string;
  phone: string;
  password: string;
  //   role: string;
  token?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading?: boolean;
  error?: string | null;
  _persist: {
    rehydrated: boolean;
  };
}
