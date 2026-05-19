import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice";
import reportReducer from "./reportSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";

const presistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["token", "user"],
};

const persistedReducer = persistReducer(presistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    reports: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const presistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
