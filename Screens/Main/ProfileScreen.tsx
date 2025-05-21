import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../Context/AuthContext";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../lib/navigator";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function ProfileScreen() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/profiles?select=*&user_id=eq.${userId}`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setProfile(data[0]);
    } catch (e) {
      console.error(e);
      Alert.alert("❌ 에러", "프로필 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 프로필</Text>

      {profile ? (
        <>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>👤</Text>
              </View>
            )}
          </View>
          <Text style={styles.infoLabel}>닉네임</Text>
          <Text style={styles.infoValue}>{profile.nickname || "없음"}</Text>

          <Text style={styles.infoLabel}>이름</Text>
          <Text style={styles.infoValue}>{profile.full_name || "없음"}</Text>

          <Text style={styles.infoLabel}>성별</Text>
          <Text style={styles.infoValue}>
            {profile.gender === "male"
              ? "남성"
              : profile.gender === "female"
              ? "여성"
              : "미입력"}
          </Text>

          <Text style={styles.infoLabel}>출생연도</Text>
          <Text style={styles.infoValue}>{profile.birth_year || "미입력"}</Text>

          <Text style={styles.infoLabel}>자격증</Text>
          <Text style={styles.infoValue}>
            {profile.certification && profile.certification.length > 0
              ? profile.certification.join(", ")
              : "없음"}
          </Text>

          <Text style={styles.infoLabel}>소개글</Text>
          <Text style={styles.infoValue}>{profile.bio || "없음"}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile", { profile })}
          >
            <Text style={styles.editText}>수정하기</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>등록된 프로필이 없습니다.</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>새로 등록하기</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editText: {
    color: "white",
    fontWeight: "bold",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 36,
    color: "#777",
  },
});
