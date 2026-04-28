import React, { useRef, useEffect, useCallback, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useRecognizeFaceMutation } from "../features/face/faceApi";
import { setStatus, setProcessing, setLastRecognition } from "../features/face/faceSlice";
import { speakWelcome, speakUnauthorized } from "../utils/speech";
import { RECOGNITION_INTERVAL } from "../services/api";
import FaceBoundingBox from "./FaceBoundingBox";
import StatusIndicator from "./StatusIndicator";
import GlassCard from "./GlassCard";

interface CameraViewComponentProps {
  enabled?: boolean;
  onRecognized?: (name: string) => void;
}

export default function CameraViewComponent({ enabled = true, onRecognized }: CameraViewComponentProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recognizeFace] = useRecognizeFaceMutation();

  const dispatch = useAppDispatch();
  const { status, isProcessing, lastRecognizedUser } = useAppSelector((s) => s.face);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [scanStatus, setScanStatus] = useState<"scanning" | "authorized" | "unauthorized" | "idle">("idle");

  const captureAndRecognize = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;
    dispatch(setProcessing(true));
    dispatch(setStatus("recognizing"));

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5, base64: true, skipProcessing: true,
      });
      if (!photo?.base64) { dispatch(setProcessing(false)); return; }

      const result = await recognizeFace({ image: photo.base64 }).unwrap();
      if (result.status === "authorized" && result.name) {
        dispatch(setLastRecognition({ name: result.name, confidence: result.confidence, status: "authorized" }));
        setScanStatus("authorized");
        speakWelcome(result.name);
        onRecognized?.(result.name);
      } else if (result.status === "unauthorized") {
        dispatch(setLastRecognition({ name: null, confidence: result.confidence, status: "unauthorized" }));
        setScanStatus("unauthorized");
        speakUnauthorized();
        setTimeout(() => setScanStatus("scanning"), 2000);
      } else {
        dispatch(setStatus("detecting"));
        setScanStatus("scanning");
      }
    } catch {
      dispatch(setStatus("error"));
    } finally {
      dispatch(setProcessing(false));
    }
  }, [isProcessing, dispatch, recognizeFace, onRecognized]);

  useEffect(() => {
    if (enabled && isAuthenticated !== undefined) {
      dispatch(setStatus("detecting"));
      setScanStatus("scanning");
      intervalRef.current = setInterval(captureAndRecognize, RECOGNITION_INTERVAL);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, captureAndRecognize]);

  if (!permission) return <View style={styles.container}><Text style={styles.text}>Loading...</Text></View>;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <GlassCard>
          <Text style={styles.text}>Camera access is required</Text>
          <Text style={[styles.text, { fontSize: 14, opacity: 0.6, marginTop: 8 }]} onPress={requestPermission}>
            Tap to grant permission
          </Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
      {/* Dark overlay */}
      <View style={styles.overlay} />
      {/* Scan frame */}
      <View style={styles.scanArea}>
        <FaceBoundingBox status={scanStatus} />
      </View>
      {/* Status card */}
      <View style={styles.statusArea}>
        <GlassCard>
          <StatusIndicator status={status} userName={lastRecognizedUser} />
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  scanArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusArea: { position: "absolute", bottom: 40, left: 20, right: 20 },
  text: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
});
