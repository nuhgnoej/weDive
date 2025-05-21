// screens/RoomDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NavigationProp, RootStackParamList } from "../lib/navigator";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Context/AuthContext";

export default function RoomDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RoomApplicants">>();
  const navigation = useNavigation<NavigationProp>();

  const { roomId } = route.params;
  const { userId } = useAuth();

  const [room, setRoom] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false); // ✅ 참가 신청 여부

  const fetchRoom = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("로그인이 필요합니다.");
      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/rooms?id=eq.${roomId}&select=*`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setRoom(data[0]);
    } catch (err) {
      console.error("❌ 방 정보 로딩 실패:", err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("로그인이 필요합니다.");

      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/participants?room_id=eq.${roomId}&status=in.(pending,approved)&select=*,profile:profiles(nickname)`,
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

  const checkJoinStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/participants?room_id=eq.${roomId}&status=eq.pending&select=*,profile:profiles(nickname)`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setHasRequested(data.length > 0);
    } catch (err) {
      console.error("❌ 참가 상태 확인 실패:", err);
    }
  };

  const updateStatus = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      setLoadingId(id);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("로그인이 필요합니다.");
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

      setApplicants((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("❌ 상태 업데이트 실패:", err);
      Alert.alert("에러", "참가자 상태를 변경하지 못했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  const requestJoin = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) throw new Error("로그인이 필요합니다.");
      const res = await fetch(`${SUPABASE_API_URL}/rest/v1/participants`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          user_id: userId,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error("신청 실패");

      setHasRequested(true); // ✅ 버튼 비활성화 유지
      Alert.alert("신청 완료", "참가 요청을 보냈습니다.");
    } catch (err) {
      console.error("❌ 참가 요청 실패:", err);
      Alert.alert("에러", "참가 요청에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchRoom();
    fetchApplicants();
    checkJoinStatus();
  }, []);

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const isOwner = room.creator_id === userId;
  const approvedParticipants = applicants.filter(
    (a) => a.status === "approved" || a.user_id === room.creator_id
  );
  const pendingParticipants = applicants.filter((a) => a.status === "pending");
  const isApprovedMember = approvedParticipants.some(
    (p) => p.user_id === userId
  );
  const canEnterChat = isApprovedMember || isOwner;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>방 정보</Text>
      <RoomInfo room={room} />
      <Text style={{ marginVertical: 8 }}>
        현재 참가 인원: {approvedParticipants.length} / {room.max_people}
      </Text>
      {!isOwner && (
        <>
          {isApprovedMember ? (
            <View style={[styles.joinButton, { backgroundColor: "#A0A0A0" }]}>
              <Text style={styles.buttonText}>이미 참가 중입니다</Text>
            </View>
          ) : hasRequested ? (
            <View style={[styles.joinButton, { backgroundColor: "#A0A0A0" }]}>
              <Text style={styles.buttonText}>승인 대기 중</Text>
            </View>
          ) : approvedParticipants.length >= room.max_people ? (
            <View style={[styles.joinButton, { backgroundColor: "#FF3B30" }]}>
              <Text style={styles.buttonText}>정원 마감</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={requestJoin}>
              <Text style={styles.buttonText}>참가하기</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {isOwner ? (
        <>
          <Text style={styles.title}>✅ 승인된 참가자</Text>
          {approvedParticipants.length > 0 ? (
            <FlatList
              data={approvedParticipants}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text>
                    🧑 {item.profile?.nickname || "닉네임 없음"}
                    {item.user_id === room.creator_id && " (방장)"}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={{ color: "#888" }}>
              아직 승인된 참가자가 없습니다.
            </Text>
          )}

          <Text style={styles.title}>⏳ 승인 대기 중</Text>
          {pendingParticipants.length > 0 ? (
            <FlatList
              data={pendingParticipants}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text>🧑 {item.profile?.nickname || "닉네임 없음"}</Text>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, "approved")}
                      style={[styles.button, { backgroundColor: "#4CAF50" }]}
                      disabled={loadingId === item.id}
                    >
                      <Text style={styles.buttonText}>승인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => updateStatus(item.id, "rejected")}
                      style={[styles.button, { backgroundColor: "#F44336" }]}
                      disabled={loadingId === item.id}
                    >
                      <Text style={styles.buttonText}>거절</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={{ color: "#888" }}>대기 중인 참가자가 없습니다.</Text>
          )}
        </>
      ) : null}
      {canEnterChat && (
        <TouchableOpacity
          style={[
            styles.joinButton,
            { marginTop: 10, backgroundColor: "#34C759" },
          ]}
          onPress={() => navigation.navigate("ChatRoom", { roomId })}
        >
          <Text style={styles.buttonText}>💬 채팅방 입장</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RoomInfo({ room }: { room: any }) {
  return (
    <>
      <Text>📍 장소: {room.location}</Text>
      <Text>📅 날짜: {room.date}</Text>
      <Text>⏰ 집결 시간: {room.meet_time}</Text>
      <Text>👥 모집 인원: {room.max_people}</Text>
      <Text>🥽 자격 요건: {room.license_required}</Text>
      <Text>📝 설명: {room.description}</Text>
    </>
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
  joinButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
});
