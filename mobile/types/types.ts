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

export enum Violation {
  Speeding = "speeding",
  RunningRedLight = "running_red_light",
  DrunkDriving = "drunk_driving",
  RecklessDriving = "reckless_driving",
}

export interface Post {
  id: string;
  image: string;
  violation: Violation;
  description: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
