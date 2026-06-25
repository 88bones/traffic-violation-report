import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
  locationName: null,
};

const locationSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{
        latitude: number;
        longitude: number;
        locationName: string;
      }>,
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.locationName = action.payload.locationName;
    },
    clearLocation: (state) => {
      state.latitude = null;
      state.longitude = null;
      state.locationName = null;
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
