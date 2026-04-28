/**
 * StatusIndicator — Animated status display for face recognition states.
 * Shows detecting, recognizing, welcome, unauthorized states with transitions.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Status =
  | "idle"
  | "detecting"
  | "recognizing"
  | "authorized"
  | "unauthorized"
  | "no_face"
  | "error";

interface StatusIndicatorProps {
  status: Status;
  userName?: string | null;
}

const STATUS_CONFIG: Record<
  Status,
  { text: string; color: string; icon: string }
> = {
  idle: { text: "Ready to scan", color: "#6b7280", icon: "⏸" },
  detecting: { text: "Detecting face...", color: "#00e5ff", icon: "👁" },
  recognizing: { text: "Recognizing...", color: "#00e5ff", icon: "🔍" },
  authorized: { text: "Welcome", color: "#00e676", icon: "✓" },
  unauthorized: { text: "Unauthorized Access", color: "#ff1744", icon: "✗" },
  no_face: { text: "No face detected", color: "#ff9800", icon: "👤" },
  error: { text: "Error occurred", color: "#ff1744", icon: "⚠" },
};

export default function StatusIndicator({
  status,
  userName,
}: StatusIndicatorProps) {
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);
  const dotOpacity = useSharedValue(0.3);
  const shake = useSharedValue(0);

  const config = STATUS_CONFIG[status];
  const displayText =
    status === "authorized" && userName
      ? `Welcome, ${userName}`
      : config.text;

  useEffect(() => {
    // Entry animation
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 150 });

    // Status-specific animations
    if (status === "detecting" || status === "recognizing") {
      dotOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.3, { duration: 600 })
        ),
        -1,
        true
      );
    }

    if (status === "unauthorized" || status === "error") {
      shake.value = withSequence(
        withTiming(-8, { duration: 60, easing: Easing.linear }),
        withTiming(8, { duration: 60, easing: Easing.linear }),
        withTiming(-6, { duration: 60, easing: Easing.linear }),
        withTiming(6, { duration: 60, easing: Easing.linear }),
        withTiming(0, { duration: 60, easing: Easing.linear })
      );
    }

    return () => {
      scale.value = 0.8;
      translateY.value = 20;
    };
  }, [status, userName]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { translateX: shake.value },
    ],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: config.color },
            dotStyle,
          ]}
        />
        <Text style={[styles.icon]}>{config.icon}</Text>
        <Text style={[styles.text, { color: config.color }]}>
          {displayText}
        </Text>
      </View>

      {status === "authorized" && (
        <View style={[styles.successBar, { backgroundColor: config.color }]} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  successBar: {
    height: 2,
    width: 60,
    borderRadius: 1,
    marginTop: 8,
    opacity: 0.6,
  },
});
