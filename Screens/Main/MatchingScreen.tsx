// screens/MatchingScreen.tsx

import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp, RootStackParamList } from "../../lib/navigator";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../Context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function MatchingScreen() {
  type MatchingScreenNav = NativeStackNavigationProp<
    RootStackParamList,
    "Matching"
  >;
  const navigation = useNavigation<MatchingScreenNav>();
  const { user, userId } = useAuth();

  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  // ✅ 채팅방 목록 불러오기
  const fetchRooms = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      // ✅ 내가 참여 중인 방
      const myRes = await fetch(
        `${SUPABASE_API_URL}/rest/v1/rooms?select=*,participants!inner(user_id,room_id,status)&participants.user_id=eq.${userId}&participants.status=eq.approved`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const myData = await myRes.json();
      const myRoomIds = myData.map((r: any) => r.id);
      setMyRooms(myData);

      // 2. 전체 공개방을 불러오고 내가 참가한 방은 제외
      const pubRes = await fetch(
        `${SUPABASE_API_URL}/rest/v1/rooms?public=eq.true&select=*`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const pubData = await pubRes.json();

      // ✅ 내가 참가한 방 제외
      const filtered = pubData.filter((r: any) => !myRoomIds.includes(r.id));
      setPublicRooms(filtered);
    } catch (err) {
      console.error("❌ 채팅방 목록 로딩 실패:", err);
    }
  };

  // ✅ 채팅방 생성
  const handleCreateRoom = async () => {
    navigation.navigate("CreateMatchRoom");
  };

  // ✅ 채팅방 입장
  const handleEnterRoom = (roomId: string) => {
    navigation.navigate("RoomDetail", { roomId });
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>버디 매칭</Text>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text style={styles.createButtonText}>채팅방 생성</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>내가 참여 중인 방</Text>
      <FlatList
        data={myRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomCard}
            onPress={() => handleEnterRoom(item.id)}
          >
            <Text style={styles.roomTitle}>📍 {item.title}</Text>
            <Text style={styles.roomStatus}>
              생성일: {new Date(item.created_at).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#888" }}>참여 중인 방이 없습니다.</Text>
        }
      />

      <Text style={styles.sectionTitle}>공개 매칭방</Text>
      <FlatList
        data={publicRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomCard}
            onPress={() => handleEnterRoom(item.id)}
          >
            <Text style={styles.roomTitle}>📍 {item.title}</Text>
            <Text style={styles.roomStatus}>
              생성일: {new Date(item.created_at).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#888" }}>참여 가능한 공개방이 없습니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flex: 1,
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
