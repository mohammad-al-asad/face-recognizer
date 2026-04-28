/**
 * Redux store configuration with RTK Query middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import { faceApi } from "../features/face/faceApi";
import { authApi } from "../features/auth/authApi";
import faceReducer from "../features/face/faceSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    // RTK Query reducers
    [faceApi.reducerPath]: faceApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    // Slice reducers
    face: faceReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in RTK Query
        ignoredActions: ["face/setLastRecognition"],
      },
    })
      .concat(faceApi.middleware)
      .concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
