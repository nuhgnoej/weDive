import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../Context/AuthContext";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import { NavigationProp } from "../../lib/navigator";

export default function ChatRoomsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/rooms?select=*&created_by=eq.${user}`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("❌ 에러", data?.message || "채팅방 로딩 실패");
        return;
      }

      setRooms(data);
    } catch (err) {
      console.error(err);
      Alert.alert("❌ 네트워크 에러", String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const renderRoom = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => navigation.navigate("ChatRoom", { roomId: item.id })}
    >
      <Text style={styles.roomTitle}>📍 {item.location}</Text>
      <Text style={styles.roomInfo}>
        📅 {item.date} | 👥 {item.max_people}명
      </Text>
      {item.description ? (
        <Text style={styles.roomDesc}>📝 {item.description}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 채팅방 목록</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoom}
          ListEmptyComponent={
            <Text style={styles.emptyText}>채팅방이 없습니다.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  roomCard: {
    backgroundColor: "#fff",
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
  roomInfo: {
    marginTop: 5,
    color: "#333",
  },
  roomDesc: {
    marginTop: 8,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#aaa",
  },
});
