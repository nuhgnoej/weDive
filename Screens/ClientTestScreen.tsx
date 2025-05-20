import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { io } from "socket.io-client";

const SERVER_URL = "http://10.0.8.50:3000"; // <-- 여기에 서버 IP 주소 입력!

export default function ClientTestScreen() {
  useEffect(() => {
    const socket = io(
      "https://ominous-capybara-5g5x49wj5rgvhpx7w-3000.app.github.dev/",
      {
        transports: ["websocket"],
        secure: true,
      }
    );

    socket.on("connect", () => {
      console.log("🟢 연결됨:", socket.id);
      socket.emit("joinRoom", "room1");
    });

    socket.on("newMessage", (data) => {
      console.log("📨 새 메시지 수신:", data);
    });

    socket.on("disconnect", () => {
      console.log("🔌 연결 종료됨");
    });

    // 컴포넌트 언마운트 시 소켓 닫기
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>📡 Socket 연결 테스트 중...</Text>
    </View>
  );
}
