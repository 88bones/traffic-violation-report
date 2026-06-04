import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import AppWrapper from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppWrapper />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
