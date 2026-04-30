export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
