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
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_API_URL, API_KEY);

type ChatRoomRouteProp = RouteProp<RootStackParamList, "ChatRoom">;

export default function ChatRoomScreen() {
  const route = useRoute<ChatRoomRouteProp>();
  const { roomId } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const flatListRef = useRef<FlatList>(null);

  // 기존 메시지 불러오기
  const fetchMessages = async () => {
    const token = await AsyncStorage.getItem("access_token");

    const res = await fetch(
      `${SUPABASE_API_URL}/rest/v1/messages?room_id=eq.${roomId}&select=*&order=created_at.asc`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setMessages(data);
  };

  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 최초 메시지 로딩
  useEffect(() => {
    fetchMessages();
  }, []);

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = await AsyncStorage.getItem("access_token");

    const res = await fetch(`${SUPABASE_API_URL}/rest/v1/messages`, {
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

    const data = await res.json();
    if (!res.ok) {
      Alert.alert("❌ 전송 실패", data?.message || "메시지 전송 실패");
      return;
    }

    setNewMessage("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
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
    </KeyboardAvoidingView>
  );
}

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
