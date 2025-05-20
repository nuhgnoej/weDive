import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../lib/navigator";

export default function MatchingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleCreateRoom = () => {
    navigation.navigate("CreateMatchRoom");
  };

  const handleEnterRoom = (roomId: string) => {
    navigation.navigate("ChatRoom", { roomId });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>버디 매칭</Text>

      {/* 채팅방 생성 */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text style={styles.createButtonText}>새 매칭 방 만들기</Text>
      </TouchableOpacity>

      {/* 매칭된 채팅방 목록 */}
      <Text style={styles.sectionTitle}>내 매칭 채팅방</Text>
      {[1, 2, 3].map((id) => (
        <TouchableOpacity
          key={id}
          style={styles.roomCard}
          onPress={() => handleEnterRoom(`room-${id}`)}
        >
          <Text style={styles.roomTitle}>📍 하남 미사풀 / 5월 25일</Text>
          <Text style={styles.roomStatus}>모집 중 | 인원 2/4</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
  },
  roomCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 1,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roomStatus: {
    marginTop: 5,
    color: "#555",
  },
});
