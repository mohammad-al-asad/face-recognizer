/**
 * GradientButton — Premium gradient button with neon glow and press animation.
 */

import React, { useCallback } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[];
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

const VARIANT_COLORS = {
  primary: ["#00e5ff", "#b24dff"] as const,
  secondary: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"] as const,
  danger: ["#ff1744", "#ff6090"] as const,
};

export default function GradientButton({
  title,
  onPress,
  colors,
  icon,
  style,
  textStyle,
  disabled = false,
  variant = "primary",
}: GradientButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.9);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1);
  }, []);

  const gradientColors = colors || [...VARIANT_COLORS[variant]];
  const glowColor =
    variant === "danger"
      ? "rgba(255,23,68,0.35)"
      : variant === "primary"
      ? "rgba(0,229,255,0.35)"
      : "transparent";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        styles.wrapper,
        { shadowColor: glowColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.secondaryText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 8,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryText: {
    fontWeight: "600",
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
