import { Report } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  reports: [],
  isLoading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload;
    },
    setReportLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setReportError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter((r) => r._id !== action.payload);
    },
  },
});

export const { setReports, setReportLoading, setReportError, removeReport } =
  reportSlice.actions;
export default reportSlice.reducer;
