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

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Report {
  _id: string;
  image: string;
  number_plate: string;
  violation: Violation;
  description: string;
  location: Location;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}
