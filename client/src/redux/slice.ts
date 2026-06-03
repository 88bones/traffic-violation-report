import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/types/types";

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = false;
      state.error = null;

      localStorage.setItem("token", action.payload.token);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;

      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, setLoading, setError, logout } =
  authSlice.actions;

export default authSlice.reducer;
