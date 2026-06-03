export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export enum Violation {
  Speeding = "speeding",
  RunningRedLight = "running_red_light",
  DrunkDriving = "drunk_driving",
  RecklessDriving = "reckless_driving",
}

export interface Location {
  name?: string;
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
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}