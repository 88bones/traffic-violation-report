import { AuthState } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  _persist: {
    rehydrated: false,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState["user"] }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
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
      state.error = null;
    },
  },
});

export const { setCredentials, setLoading, setError, logout } =
  authSlice.actions;
export default authSlice.reducer;
