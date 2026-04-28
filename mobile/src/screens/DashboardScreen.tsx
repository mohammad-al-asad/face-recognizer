import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { useLoginMutation } from "../features/auth/authApi";
import { setCredentials, logout } from "../features/auth/authSlice";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = { Home: undefined; Dashboard: undefined; AddFace: undefined; Users: undefined };
type NavProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();
  const { isAuthenticated, username } = useAppSelector((s) => s.auth);
  const { lastRecognizedUser, lastRecognitionTime, lastConfidence } = useAppSelector((s) => s.face);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [login, { isLoading: loginLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!loginUsername || !loginPassword) { Alert.alert("Error", "Please enter credentials"); return; }
    try {
      const result = await login({ username: loginUsername, password: loginPassword }).unwrap();
      dispatch(setCredentials({ accessToken: result.access_token, username: loginUsername }));
    } catch { Alert.alert("Login Failed", "Invalid username or password"); }
  };

  const handleLogout = () => { dispatch(logout()); navigation.navigate("Home"); };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <AnimatedBackground />
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text style={styles.title}>🔐 Admin Login</Text>
              <Text style={styles.subtitle}>Enter your credentials to access the dashboard</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <GlassCard style={{ marginTop: 32 }}>
                <Text style={styles.label}>Username</Text>
                <TextInput style={styles.input} value={loginUsername} onChangeText={setLoginUsername}
                  placeholder="admin" placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="none" />
                <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
                <TextInput style={styles.input} value={loginPassword} onChangeText={setLoginPassword}
                  placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
                <View style={{ marginTop: 24 }}>
                  <GradientButton title={loginLoading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loginLoading} />
                </View>
              </GlassCard>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={styles.title}>🏠 Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {username}</Text>
          </Animated.View>

          {/* User Info Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={{ marginTop: 24 }} neonColor="#00e5ff">
              <Text style={styles.cardTitle}>Last Recognition</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User</Text>
                <Text style={styles.infoValue}>{lastRecognizedUser || "—"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Confidence</Text>
                <Text style={styles.infoValue}>{lastConfidence ? `${(lastConfidence * 100).toFixed(1)}%` : "—"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{lastRecognitionTime ? new Date(lastRecognitionTime).toLocaleTimeString() : "—"}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: lastRecognizedUser ? "rgba(0,230,118,0.2)" : "rgba(255,255,255,0.1)" }]}>
                <Text style={[styles.statusText, { color: lastRecognizedUser ? "#00e676" : "rgba(255,255,255,0.5)" }]}>
                  {lastRecognizedUser ? "✓ Verified" : "No Data"}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actions}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <GradientButton title="➕  Add New Face" onPress={() => navigation.navigate("AddFace")} />
            <View style={{ height: 12 }} />
            <GradientButton title="📸  Test Recognition" variant="secondary" onPress={() => navigation.navigate("Home")} />
            <View style={{ height: 12 }} />
            <GradientButton title="📋  View Users" variant="secondary" onPress={() => navigation.navigate("Users")} />
            <View style={{ height: 12 }} />
            <GradientButton title="Logout" variant="danger" onPress={handleLogout} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050510" },
  safe: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 32, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4, letterSpacing: 1 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cardTitle: { color: "#00e5ff", fontSize: 13, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  infoLabel: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  infoValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 16 },
  statusText: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  actions: { marginTop: 28 },
  sectionTitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 },
});
