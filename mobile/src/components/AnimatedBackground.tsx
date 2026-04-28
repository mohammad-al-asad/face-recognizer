import React, { useEffect } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
  type SharedValue,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

export default function AnimatedBackground() {
  const o1X = useSharedValue(-50), o1Y = useSharedValue(-30);
  const o2X = useSharedValue(50),  o2Y = useSharedValue(40);
  const o3X = useSharedValue(0),   o3Y = useSharedValue(-20);

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);
    const anim = (sv: SharedValue<number>, to: number, dur: number) =>
      sv.value = withRepeat(withSequence(
        withTiming(to, { duration: dur, easing: ease }),
        withTiming(sv.value, { duration: dur, easing: ease })
      ), -1, true);
    anim(o1X, 60, 8000); anim(o1Y, 50, 10000);
    anim(o2X, -40, 9000); anim(o2Y, -50, 7000);
    anim(o3X, 30, 11000); anim(o3Y, 60, 6000);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateX: o1X.value }, { translateY: o1Y.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateX: o2X.value }, { translateY: o2Y.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateX: o3X.value }, { translateY: o3Y.value }] }));

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient colors={["#050510","#0a0a2e","#1a0a3e","#050510"]} locations={[0,0.3,0.7,1]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.orb, { width: SW*0.9, height: SW*0.9, top: -SW*0.2, left: -SW*0.15 }, s1]}>
        <LinearGradient colors={["rgba(0,229,255,0.25)","rgba(0,229,255,0)"]} style={styles.orbG} start={{x:0.5,y:0.5}} end={{x:1,y:1}} />
      </Animated.View>
      <Animated.View style={[styles.orb, { width: SW*0.8, height: SW*0.8, bottom: SH*0.1, right: -SW*0.2 }, s2]}>
        <LinearGradient colors={["rgba(178,77,255,0.2)","rgba(178,77,255,0)"]} style={styles.orbG} start={{x:0.5,y:0.5}} end={{x:1,y:1}} />
      </Animated.View>
      <Animated.View style={[styles.orb, { width: SW*0.6, height: SW*0.6, bottom: -SW*0.1, left: SW*0.1 }, s3]}>
        <LinearGradient colors={["rgba(255,45,135,0.15)","rgba(255,45,135,0)"]} style={styles.orbG} start={{x:0.5,y:0.5}} end={{x:1,y:1}} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: "absolute", borderRadius: 999, overflow: "hidden" },
  orbG: { width: "100%", height: "100%", borderRadius: 999 },
});
