import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from './slices/userSlice';
import candidateReducer from './slices/candidateSlice';
import candidateVerificationReducer from './slices/candidateVerificationSlice';
import activityLogReducer from "./slices/activitylogSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    candidate: candidateReducer,
    candidateProfile: candidateVerificationReducer,
    activityLog: activityLogReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
