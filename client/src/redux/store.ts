import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice";

const loadState = () => {
  try {
    return {
      auth: {
        token: localStorage.getItem("token") ?? null,
        user: JSON.parse(localStorage.getItem("user") ?? "null"),
        isLoading: false,
        error: null,
      },
    };
  } catch {
    return undefined;
  }
};

const saveState = (token: string | null, user: any) => {
  try {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  } catch {}
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(), // rehydrate on startup
});

// persist on every state change
store.subscribe(() => {
  const { token, user } = store.getState().auth;
  saveState(token, user);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
