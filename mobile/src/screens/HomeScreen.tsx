import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CameraViewComponent from "../components/CameraView";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { useAppSelector } from "../app/hooks";

type RootStackParamList = { Home: undefined; Dashboard: undefined; AddFace: undefined; Users: undefined };
type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const [cameraActive, setCameraActive] = useState(true);
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const handleRecognized = useCallback((name: string) => {
    setCameraActive(false);
    setTimeout(() => navigation.navigate("Dashboard"), 2500);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <CameraViewComponent enabled={cameraActive} onRecognized={handleRecognized} />

      {/* Header overlay */}
      <View style={styles.header}>
        <LinearGradient colors={["rgba(0,0,0,0.6)", "transparent"]} style={styles.headerGradient}>
          <Text style={styles.logo}>🧠 FaceGuard</Text>
          <Text style={styles.subtitle}>AI Recognition System</Text>
        </LinearGradient>
      </View>

      {/* Admin access button */}
      {!isAuthenticated && (
        <View style={styles.adminBtn}>
          <GradientButton
            title="Admin Login"
            variant="secondary"
            onPress={() => navigation.navigate("Dashboard")}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  logo: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4, letterSpacing: 2, textTransform: "uppercase" },
  adminBtn: { position: "absolute", top: 60, right: 20, zIndex: 20 },
});
