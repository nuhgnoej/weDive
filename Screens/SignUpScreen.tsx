// screens/SignUpScreen.tsx
import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../lib/navigator";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<NavigationProp>();

  const handleSignUp = async () => {
    try {
      const res = await fetch(`${SUPABASE_API_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("✅ 회원가입 성공", "인증 이메일을 확인해주세요!");
        console.log("가입 후 응답:", data);
        navigation.navigate("Login");
      }
    } catch (error) {
      Alert.alert("❌ 네트워크 오류", String(error));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Button title="회원가입" onPress={handleSignUp} />
    </View>
  );
}
