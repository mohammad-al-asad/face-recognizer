/**
 * GlassCard — Premium glassmorphism card component.
 * Features frosted glass effect, subtle border highlight, and top-edge refraction line.
 */

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  neonColor?: string;
}

export default function GlassCard({
  children,
  style,
  intensity = 40,
  neonColor,
}: GlassCardProps) {
  return (
    <View style={[styles.wrapper, neonColor && { shadowColor: neonColor }, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        {/* Top-edge light refraction line */}
        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.refractionLine}
        />

        {/* Inner glow overlay (top-left corner) */}
        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 0.6 }}
          style={styles.innerGlow}
        />

        {/* Card content */}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blur: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  refractionLine: {
    height: 1,
    width: "100%",
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  content: {
    padding: 20,
  },
});
