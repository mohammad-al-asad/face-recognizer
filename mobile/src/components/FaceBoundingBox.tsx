/**
 * FaceBoundingBox — Animated face scan overlay with corner brackets.
 * Changes color based on recognition status.
 */

import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOX_SIZE = SCREEN_WIDTH * 0.65;
const CORNER_SIZE = 40;
const CORNER_THICKNESS = 3;

type ScanStatus = "scanning" | "authorized" | "unauthorized" | "idle";

interface FaceBoundingBoxProps {
  status?: ScanStatus;
}

const STATUS_COLORS: Record<ScanStatus, string> = {
  idle: "rgba(255,255,255,0.3)",
  scanning: "#00e5ff",
  authorized: "#00e676",
  unauthorized: "#ff1744",
};

export default function FaceBoundingBox({
  status = "scanning",
}: FaceBoundingBoxProps) {
  const pulseScale = useSharedValue(1);
  const scanLineY = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  const color = STATUS_COLORS[status];

  useEffect(() => {
    // Pulse animation for corners
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Scan line sweep
    scanLineY.value = withRepeat(
      withTiming(BOX_SIZE - 4, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: status === "scanning" ? 0.6 : 0,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: color,
  }));

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      {/* Glow background */}
      <Animated.View
        style={[
          styles.glowBg,
          glowStyle,
          {
            shadowColor: color,
            borderColor: color,
          },
        ]}
      />

      {/* Corner brackets */}
      {/* Top-left */}
      <View style={[styles.corner, styles.topLeft]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: color, width: CORNER_SIZE },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: color, height: CORNER_SIZE },
          ]}
        />
      </View>

      {/* Top-right */}
      <View style={[styles.corner, styles.topRight]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: color, width: CORNER_SIZE },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: color, height: CORNER_SIZE },
          ]}
        />
      </View>

      {/* Bottom-left */}
      <View style={[styles.corner, styles.bottomLeft]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: color, width: CORNER_SIZE },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: color, height: CORNER_SIZE },
          ]}
        />
      </View>

      {/* Bottom-right */}
      <View style={[styles.corner, styles.bottomRight]}>
        <View
          style={[
            styles.cornerH,
            { backgroundColor: color, width: CORNER_SIZE },
          ]}
        />
        <View
          style={[
            styles.cornerV,
            { backgroundColor: color, height: CORNER_SIZE },
          ]}
        />
      </View>

      {/* Scan line */}
      <Animated.View
        style={[styles.scanLine, { backgroundColor: color }, scanLineStyle]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    position: "relative",
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.15)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 5,
  },
  corner: {
    position: "absolute",
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    alignItems: "flex-end",
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  cornerH: {
    height: CORNER_THICKNESS,
    borderRadius: 2,
  },
  cornerV: {
    width: CORNER_THICKNESS,
    borderRadius: 2,
  },
  scanLine: {
    position: "absolute",
    left: CORNER_SIZE,
    right: CORNER_SIZE,
    height: 2,
    opacity: 0.6,
    borderRadius: 1,
  },
});
