import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  Button,
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { io } from "socket.io-client";

const socket = io(
  "https://ominous-capybara-5g5x49wj5rgvhpx7w-3000.app.github.dev/"
); // ⚠️ 너의 서버 주소로 변경

const roomId = "room1";
const username = "UserA";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // ✅ 과거 메시지 불러오기
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://10.0.8.50:3000/messages/${roomId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("❌ 메시지 로딩 실패:", err);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", roomId);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      roomId,
      sender: username,
      message,
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 40}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              ref={flatListRef}
              data={messages}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => {
                const isMine = item.sender === username;
                return (
                  <View
                    style={[
                      styles.messageBubble,
                      isMine ? styles.myMessage : styles.otherMessage,
                    ]}
                  >
                    {!isMine && (
                      <Text style={styles.sender}>{item.sender}</Text>
                    )}
                    <Text>{item.message}</Text>
                  </View>
                );
              }}
            />

            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="메시지를 입력하세요"
                value={message}
                onChangeText={setMessage}
              />
              <Button title="전송" onPress={sendMessage} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 12,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d0f0c0",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
  },
  sender: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 8,
  },
});
