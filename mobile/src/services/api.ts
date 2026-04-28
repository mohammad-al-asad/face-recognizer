/**
 * API configuration — base URL and constants for the Face Recognizer backend.
 */

// ⚠️ Update this to your Flask backend's LAN IP address
export const API_BASE_URL = "http://192.168.1.100:5000/api";

// Request timeouts (ms)
export const REQUEST_TIMEOUT = 15000;

// Recognition interval (ms)
export const RECOGNITION_INTERVAL = 1500;

// Speech cooldown (ms) — prevent repeated greetings
export const SPEECH_COOLDOWN = 5000;

// Max image dimension before sending
export const MAX_IMAGE_DIMENSION = 480;

// Enrollment
export const MIN_ENROLLMENT_IMAGES = 3;
export const MAX_ENROLLMENT_IMAGES = 10;
