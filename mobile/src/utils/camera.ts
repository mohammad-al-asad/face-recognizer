/**
 * Camera utility functions — permissions, image capture, and base64 conversion.
 */

import { CameraView } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { MAX_IMAGE_DIMENSION } from "../services/api";

/**
 * Capture a photo from a CameraView ref and return as base64 string.
 */
export async function captureFrame(
  cameraRef: React.RefObject<CameraView | null>
): Promise<string | null> {
  if (!cameraRef.current) return null;

  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true,
      skipProcessing: true,
    });

    if (!photo?.base64) return null;

    return photo.base64;
  } catch (error) {
    console.error("Failed to capture frame:", error);
    return null;
  }
}

/**
 * Resize an image URI to fit within MAX_IMAGE_DIMENSION.
 * Returns base64 string of the resized image.
 */
export async function resizeImage(uri: string): Promise<string | null> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_DIMENSION } }],
      { compress: 0.7, format: SaveFormat.JPEG, base64: true }
    );

    return result.base64 || null;
  } catch (error) {
    console.error("Failed to resize image:", error);
    return null;
  }
}
