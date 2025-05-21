import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Context/AuthContext";
import { NavigationProp } from "../lib/navigator";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import { signInWithGoogle } from "../lib/SignInWithGoogle";

const LoginScreen = () => {
  const { logIn } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogIn = async () => {
    if (!email || !password) {
      alert("이메일과 패스워드를 입력하세요.");
      return;
    }
    try {
      const res = await fetch(
        `${SUPABASE_API_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("❌ 로그인 실패", data.error?.description || "로그인 오류");
        return;
      }

      // 저장
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);

      Alert.alert("✅ 로그인 성공");
      await logIn(data.access_token, data.user.email, data.user.id);

      // ✅ profiles 테이블에 유저 프로필 존재 여부 확인
      const profileRes = await fetch(
        `${SUPABASE_API_URL}/rest/v1/profiles?user_id=eq.${data.user.id}`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );
      const profileData = await profileRes.json();

      if (Array.isArray(profileData) && profileData.length > 0) {
        // ✅ 프로필이 존재하면 Main 화면으로
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        // ❗ 프로필이 없으면 온보딩 화면으로
        navigation.reset({
          index: 0,
          routes: [{ name: "EditProfile" }],
        });
      }
    } catch (error) {
      Alert.alert("❌ 네트워크 오류", String(error));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { accessToken, user } = await signInWithGoogle();

      // AuthContext에 로그인 정보 저장
      await logIn(accessToken, user.email, user.id);
      console.log("✅ 로그인 성공:", user);

      // ✅ profiles 존재 여부 확인
      const profileRes = await fetch(
        `${SUPABASE_API_URL}/rest/v1/profiles?user_id=eq.${user.id}`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const profileData = await profileRes.json();

      if (Array.isArray(profileData) && profileData.length > 0) {
        // ✅ 프로필 있음 → Main
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        // ❗ 프로필 없음 → EditProfile
        navigation.reset({
          index: 0,
          routes: [{ name: "EditProfile" }],
        });
      }
    } catch (e: any) {
      Alert.alert("로그인 실패", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* 이메일 계정으로 로그인 버튼과 가입 버튼을 한쪽으로 몰고 "또는" 넣기 */}
      <View style={styles.emailAuthContainer}>
        <TouchableOpacity style={styles.authButton} onPress={handleLogIn}>
          <Ionicons name="mail" size={24} color="white" />
          <Text style={styles.authButtonText}>이메일 계정으로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Ionicons name="person-add" size={24} color="white" />
          <Text style={styles.authButtonText}>이메일 계정으로 가입하기</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>또는</Text>

        {/* 소셜 로그인 버튼들 */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={24} color="white" />
            <Text style={styles.socialButtonText}>
              구글 계정으로 로그인하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  emailAuthContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: "80%",
    justifyContent: "center",
  },
  authButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  socialButtonsContainer: {
    marginTop: 10,
    width: "80%",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  socialButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LoginScreen;
