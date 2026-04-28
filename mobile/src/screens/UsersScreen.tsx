import React from "react";
import { StyleSheet, View, Text, FlatList, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import AnimatedBackground from "../components/AnimatedBackground";
import GlassCard from "../components/GlassCard";
import GradientButton from "../components/GradientButton";
import { useGetUsersQuery, useDeleteUserMutation, type User } from "../features/face/faceApi";

export default function UsersScreen() {
  const { data, isLoading, refetch } = useGetUsersQuery();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const handleDelete = (user: User) => {
    Alert.alert("Delete User", `Remove ${user.name} and all their face data?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteUser(user.id).unwrap(); } catch { Alert.alert("Error", "Failed to delete user"); }
        },
      },
    ]);
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => (
    <Animated.View entering={FadeInRight.delay(100 * index).springify()}>
      <GlassCard style={{ marginBottom: 12 }}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userMeta}>{item.embedding_count} embeddings • {new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <GradientButton title="✕" variant="danger" onPress={() => handleDelete(item)}
            style={{ paddingHorizontal: 4, paddingVertical: 4, minWidth: 40, borderRadius: 12 }}
            textStyle={{ fontSize: 14 }} />
        </View>
      </GlassCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <SafeAreaView style={styles.safe}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text style={styles.title}>👥 Enrolled Users</Text>
          <Text style={styles.subtitle}>{data?.total || 0} users registered</Text>
        </Animated.View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#00e5ff" /></View>
        ) : (
          <FlatList
            data={data?.users || []}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <GlassCard><Text style={styles.empty}>No users enrolled yet. Add a face to get started!</Text></GlassCard>
            }
          />
        )}

        <View style={styles.footer}>
          <GradientButton title="🔄  Refresh" variant="secondary" onPress={refetch} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050510" },
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4, letterSpacing: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,229,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(0,229,255,0.3)" },
  avatarText: { color: "#00e5ff", fontSize: 20, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { color: "#fff", fontSize: 17, fontWeight: "700" },
  userMeta: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 3 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "rgba(255,255,255,0.5)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  footer: { padding: 16 },
});
