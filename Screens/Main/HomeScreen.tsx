import React from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { useAuth } from "../../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../lib/navigator";

export default function HomeScreen() {
  const { user, logOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 앱 제목 */}
      <Text style={styles.appTitle}>WeDive</Text>

      {/* 앱 설명 */}
      <Text style={styles.description}>
        WeDive는 프리다이빙을 즐기는 사용자들을 위한 매칭 플랫폼입니다.{"\n\n"}
        실시간 채팅, 프로필 기반 매칭, 자격증 검증 등 안전하고 효율적인 다이빙
        파트너 연결을 제공합니다.
      </Text>

      {/* 사용자 환영 */}
      {user && <Text style={styles.welcome}>환영합니다, {user}님! 👋</Text>}

      {/* 프로필 이동 */}
      {user && (
        <View style={styles.buttonWrapper}>
          <Button
            title="내 프로필 보기"
            onPress={() => navigation.navigate("Profile")}
          />
        </View>
      )}

      {/* 로그아웃 */}
      {user && (
        <View style={styles.buttonWrapper}>
          <Button title="로그아웃" onPress={logOut} color="#FF3B30" />
        </View>
      )}

      {/* 하단 안내 */}
      <Text style={styles.footer}>© 2025 WeDive Team</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    color: "#444",
  },
  buttonWrapper: {
    width: "80%",
    marginVertical: 10,
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: "#999",
  },
});
