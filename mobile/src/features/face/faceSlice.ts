/**
 * Face recognition state slice — manages recognition status, debouncing, and last result.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RecognitionStatus =
  | "idle"
  | "detecting"
  | "recognizing"
  | "authorized"
  | "unauthorized"
  | "no_face"
  | "error";

interface FaceState {
  status: RecognitionStatus;
  lastRecognizedUser: string | null;
  lastRecognitionTime: string | null;
  lastConfidence: number;
  isProcessing: boolean;
  lastSpeechTime: number; // timestamp for debounce
  capturedImages: string[]; // for enrollment
  enrollmentName: string;
}

const initialState: FaceState = {
  status: "idle",
  lastRecognizedUser: null,
  lastRecognitionTime: null,
  lastConfidence: 0,
  isProcessing: false,
  lastSpeechTime: 0,
  capturedImages: [],
  enrollmentName: "",
};

const faceSlice = createSlice({
  name: "face",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<RecognitionStatus>) => {
      state.status = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setLastRecognition: (
      state,
      action: PayloadAction<{
        name: string | null;
        confidence: number;
        status: RecognitionStatus;
      }>
    ) => {
      state.lastRecognizedUser = action.payload.name;
      state.lastConfidence = action.payload.confidence;
      state.status = action.payload.status;
      state.lastRecognitionTime = new Date().toISOString();
    },
    updateSpeechTime: (state) => {
      state.lastSpeechTime = Date.now();
    },
    addCapturedImage: (state, action: PayloadAction<string>) => {
      state.capturedImages.push(action.payload);
    },
    clearCapturedImages: (state) => {
      state.capturedImages = [];
    },
    setEnrollmentName: (state, action: PayloadAction<string>) => {
      state.enrollmentName = action.payload;
    },
    resetFaceState: (state) => {
      state.status = "idle";
      state.isProcessing = false;
    },
  },
});

export const {
  setStatus,
  setProcessing,
  setLastRecognition,
  updateSpeechTime,
  addCapturedImage,
  clearCapturedImages,
  setEnrollmentName,
  resetFaceState,
} = faceSlice.actions;

export default faceSlice.reducer;
