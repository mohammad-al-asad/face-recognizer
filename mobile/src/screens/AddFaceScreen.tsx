import React, { useRef, useState, useCallback } from "react";
import { StyleSheet, View, Text, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import FaceBoundingBox from "../components/FaceBoundingBox";
import { useAddFaceMutation } from "../features/face/faceApi";
import { MIN_ENROLLMENT_IMAGES, MAX_ENROLLMENT_IMAGES } from "../services/api";

export default function AddFaceScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [addFace, { isLoading }] = useAddFaceMutation();

  const captureImage = useCallback(async () => {
    if (!cameraRef.current || capturing) return;
    if (images.length >= MAX_ENROLLMENT_IMAGES) { Alert.alert("Max reached", `Maximum ${MAX_ENROLLMENT_IMAGES} images allowed`); return; }
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true, skipProcessing: true });
      if (photo?.base64) setImages((prev) => [...prev, photo.base64!]);
    } catch { Alert.alert("Error", "Failed to capture image"); }
    finally { setCapturing(false); }
  }, [capturing, images.length]);

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert("Error", "Please enter a name"); return; }
    if (images.length < MIN_ENROLLMENT_IMAGES) { Alert.alert("Error", `Capture at least ${MIN_ENROLLMENT_IMAGES} images`); return; }
    try {
      const result = await addFace({ name: name.trim(), images }).unwrap();
      Alert.alert("Success! ✓", `${result.message}\n${result.embeddings_stored} embeddings stored`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch { Alert.alert("Error", "Failed to enroll face. Please try again."); }
  };

  const reset = () => { setImages([]); setName(""); };

  if (!permission?.granted) {
    return (
      <View style={styles.container}><AnimatedBackground />
        <SafeAreaView style={styles.safe}>
          <GlassCard><Text style={styles.permText}>Camera access required</Text>
            <GradientButton title="Grant Permission" onPress={requestPermission} />
          </GlassCard>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe}>
        {/* Camera area */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.cameraWrap}>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
            <View style={styles.cameraOverlay}>
              <FaceBoundingBox status="scanning" />
            </View>
          </View>
        </Animated.View>

        {/* Controls */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.controls}>
          <GlassCard>
            <Text style={styles.sectionTitle}>Enroll New Face</Text>

            {/* Name input */}
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Enter person's name" placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="words" />

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{images.length}/{MAX_ENROLLMENT_IMAGES} images captured</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(images.length / MAX_ENROLLMENT_IMAGES) * 100}%` }]} />
              </View>
            </View>

            {/* Dots */}
            <View style={styles.dots}>
              {Array.from({ length: MAX_ENROLLMENT_IMAGES }).map((_, i) => (
                <View key={i} style={[styles.dot, i < images.length && styles.dotFilled]} />
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <GradientButton title={capturing ? "Capturing..." : "📸 Capture"} onPress={captureImage}
                disabled={capturing || images.length >= MAX_ENROLLMENT_IMAGES} />
              <View style={{ height: 10 }} />
              <GradientButton title={isLoading ? "Uploading..." : "✓ Submit"} onPress={handleSubmit}
                disabled={isLoading || images.length < MIN_ENROLLMENT_IMAGES || !name.trim()} />
              <View style={{ height: 10 }} />
              <GradientButton title="Reset" variant="danger" onPress={reset} />
            </View>
          </GlassCard>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050510" },
  safe: { flex: 1 },
  cameraWrap: { height: "40%", margin: 16 },
  cameraContainer: { flex: 1, borderRadius: 24, overflow: "hidden", backgroundColor: "#000" },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  controls: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { color: "#00e5ff", fontSize: 13, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 16 },
  progressRow: { marginBottom: 8 },
  progressText: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 },
  progressBar: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#00e5ff", borderRadius: 2 },
  dots: { flexDirection: "row", gap: 6, marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.15)" },
  dotFilled: { backgroundColor: "#00e5ff" },
  buttons: { marginTop: 4 },
  permText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 16 },
});
