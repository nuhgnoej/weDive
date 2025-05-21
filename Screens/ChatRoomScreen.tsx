// screens/ChatRoomScreen.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../lib/navigator";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type ChatRoomRouteProp = RouteProp<RootStackParamList, "ChatRoom">;

export default function ChatRoomScreen() {
  const route = useRoute<ChatRoomRouteProp>();
  const { roomId } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const flatListRef = useRef<FlatList>(null);

  // ✅ Supabase REST API로 메시지 불러오기
  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await fetch(
        `${SUPABASE_API_URL}/rest/v1/messages?room_id=eq.${roomId}&select=*&order=created_at.asc`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "메시지 로딩 실패");
      setMessages(data);
    } catch (error) {
      console.error("❌ 메시지 로딩 실패:", error);
      Alert.alert("에러", "메시지를 불러오지 못했습니다.");
    }
  };

  // ✅ REST API로 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await fetch(`${SUPABASE_API_URL}/rest/v1/messages`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify([
          {
            room_id: roomId,
            sender: user,
            content: newMessage.trim(),
          },
        ]),
      });

      const data = await response.json();

      const newDataMessage = Array.isArray(data) ? data[0] : data;

      if (!response.ok) {
        throw new Error(data.message || "메시지 전송 실패");
      }

      // 로컬 메시지에 추가
      setMessages((prev) => [...prev, newDataMessage]);
      setNewMessage("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      Alert.alert("에러", "메시지를 전송하지 못했습니다.");
    }
  };

  // ✅ 최초 1회 메시지 불러오기
  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false }); // 입장 시 자동 스크롤
      }, 50);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === user ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <Text style={styles.messageSender}>{item.sender}</Text>
              <Text>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={styles.chatContainer}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="메시지를 입력하세요..."
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: "white", fontWeight: "bold" }}>전송</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ✅ 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatContainer: {
    padding: 16,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
  },
  messageSender: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
});
