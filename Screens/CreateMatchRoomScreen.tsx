import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Context/AuthContext";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import { NavigationProp } from "../lib/navigator";

export default function CreateMatchRoomScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [license, setLicense] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [description, setDescription] = useState("");

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("access_token");
      setAccessToken(token);
    };
    getToken();
  }, []);

  const handleCreateRoom = async () => {
    if (!date || !location || !maxPeople) {
      Alert.alert("⚠️ 필수 항목", "날짜, 지역, 인원을 입력하세요.");
      return;
    }

    if (!accessToken) {
      Alert.alert("❌ 로그인 필요", "access token이 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_API_URL}/rest/v1/rooms`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation", // 생성된 row를 응답받기 위해
        },
        body: JSON.stringify([
          {
            date,
            location,
            license,
            max_people: Number(maxPeople),
            description,
            created_by: user ?? "unknown",
          },
        ]),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        Alert.alert("❌ 생성 실패", data?.message || "방 생성 실패");
        return;
      }

      Alert.alert("✅ 방이 생성되었습니다!");
      navigation.navigate("ChatRoom", { roomId: data[0].id }); // roomId로 이동 (또는 goBack)
    } catch (error) {
      console.error(error);
      Alert.alert("❌ 네트워크 오류", String(error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>채팅방 만들기</Text>

      <TextInput
        placeholder="📅 날짜 (예: 2024-06-10)"
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        placeholder="📍 지역 (예: 하남 미사)"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        placeholder="🏅 필요 라이선스 (선택)"
        style={styles.input}
        value={license}
        onChangeText={setLicense}
      />
      <TextInput
        placeholder="👥 모집 인원 수 (예: 4)"
        style={styles.input}
        value={maxPeople}
        onChangeText={setMaxPeople}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="📝 설명 (선택)"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
        <Text style={styles.buttonText}>채팅방 생성하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
