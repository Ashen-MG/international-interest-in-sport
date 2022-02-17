import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import uploadCorrectionsReducer from "admin_secretary_shared/components/upload_funding_data/correctionsSlice";

export const store = configureStore({
  reducer: {
    secretaryUploadCorrections: uploadCorrectionsReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
