/**
 * Face recognition related types shared between frontend and backend.
 */

export interface RecognitionResult {
  name: string | null;
  status: "authorized" | "unauthorized" | "no_face";
  confidence: number;
  timestamp: string;
}

export interface AddFaceRequest {
  name: string;
  images: string[]; // base64 encoded image strings
}

export interface AddFaceResponse {
  message: string;
  user_id: string;
  embeddings_stored: number;
  total_images_processed: number;
}

export interface FaceDetectionResult {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rollAngle: number;
  yawAngle: number;
}

export type RecognitionStatus =
  | "idle"
  | "detecting"
  | "recognizing"
  | "authorized"
  | "unauthorized"
  | "no_face"
  | "error";
