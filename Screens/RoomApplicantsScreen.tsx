import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../lib/navigator";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoomApplicantsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RoomApplicants">>();
  const { roomId } = route.params;

  const [applicants, setApplicants] = useState<any[]>([]);

  const fetchApplicants = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/participants?room_id=eq.${roomId}&status=eq.pending&select=*,user:auth.users(email)`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setApplicants(data);
    } catch (err) {
      console.error("❌ 참가자 목록 로딩 실패:", err);
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/participants?id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("상태 업데이트 실패");
      fetchApplicants();
    } catch (err) {
      console.error("❌ 상태 업데이트 실패:", err);
      Alert.alert("에러", "참가자 상태를 변경하지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>참가 요청 목록</Text>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.email}>📧 {item.user.email}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => updateStatus(item.id, "approved")}
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
              >
                <Text style={styles.buttonText}>승인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateStatus(item.id, "rejected")}
                style={[styles.button, { backgroundColor: "#F44336" }]}
              >
                <Text style={styles.buttonText}>거절</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#888", marginTop: 20 }}>요청이 없습니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
