/**
 * Speech utility — voice feedback with debounce control.
 */

import * as Speech from "expo-speech";
import { SPEECH_COOLDOWN } from "../services/api";

let lastSpeechTimestamp = 0;

/**
 * Speak a welcome greeting for a recognized user.
 * Respects cooldown to prevent repeated triggers.
 */
export function speakWelcome(name: string): boolean {
  if (!canSpeak()) return false;

  Speech.speak(`Welcome, ${name}`, {
    language: "en-US",
    pitch: 1.0,
    rate: 0.9,
  });

  lastSpeechTimestamp = Date.now();
  return true;
}

/**
 * Speak an unauthorized access alert.
 * Respects cooldown to prevent repeated triggers.
 */
export function speakUnauthorized(): boolean {
  if (!canSpeak()) return false;

  Speech.speak("Unauthorized access detected", {
    language: "en-US",
    pitch: 0.8,
    rate: 0.85,
  });

  lastSpeechTimestamp = Date.now();
  return true;
}

/**
 * Check if enough time has passed since the last speech event.
 */
function canSpeak(): boolean {
  return Date.now() - lastSpeechTimestamp >= SPEECH_COOLDOWN;
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeech(): void {
  Speech.stop();
}

/**
 * Reset the speech cooldown timer.
 */
export function resetSpeechCooldown(): void {
  lastSpeechTimestamp = 0;
}
