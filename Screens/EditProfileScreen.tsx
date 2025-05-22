import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { API_KEY, SUPABASE_API_URL } from "../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, RootStackParamList } from "../lib/navigator";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../Context/AuthContext";

type EditProfileRouteProp = RouteProp<RootStackParamList, "EditProfile">;

export default function EditProfileScreen() {
  const route = useRoute<EditProfileRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const profileData = route.params?.profile;
  const [nickname, setNickname] = useState(profileData?.nickname || "");
  const [bio, setBio] = useState(profileData?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || "");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [gender, setGender] = useState(profileData?.gender || "");
  const [fullName, setFullName] = useState(profileData?.full_name || "");
  const [birthYear, setBirthYear] = useState(
    profileData?.birth_year?.toString() || ""
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i); // 최근 50년
  const [certifications, setCertifications] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState("");
  const allCerts = [
    "PADI 프리다이버",
    "AIDA 1",
    "AIDA 2",
    "SSI 프리다이버",
    "NAUI 스쿠버",
    "CMAS 1 Star",
  ];
  const { userId, user } = useAuth();
  const addCertification = () => {
    if (selectedCert && !certifications.includes(selectedCert)) {
      setCertifications((prev) => [...prev, selectedCert]);
      setSelectedCert(""); // 초기화
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications((prev) => prev.filter((c) => c !== cert));
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadAvatarToSupabase = async (
    uri: string,
    userId: string,
    accessToken: string
  ) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const ext = uri.split(".").pop();
    const filePath = `avatars/${userId}.${ext}`;
    const uploadUrl = `${SUPABASE_API_URL}/storage/v1/object/${filePath}`;

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": blob.type,
      },
      body: blob,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`업로드 실패: ${err}`);
    }

    return `${SUPABASE_API_URL}/storage/v1/object/public/${filePath}`;
  };

  const handleSave = async () => {
    try {
      if (!nickname.trim()) {
        Alert.alert("❌ 닉네임 필수", "닉네임을 입력해주세요.");
        return;
      }

      const token = await AsyncStorage.getItem("access_token");
      const userId = await AsyncStorage.getItem("user_id");

      if (!token || !userId) throw new Error("인증 정보 누락");

      let finalAvatarUrl = avatarUrl;

      if (imageUri) {
        finalAvatarUrl = await uploadAvatarToSupabase(imageUri, userId, token);
      }

      const body = {
        id: userId,
        email: user,
        nickname,
        full_name: fullName || null,
        bio,
        avatar_url: finalAvatarUrl,
        gender: gender || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        certifications,
      };

      const url = profileData
        ? `${SUPABASE_API_URL}/rest/v1/profiles?id=eq.${userId}`
        : `${SUPABASE_API_URL}/rest/v1/profiles`;

      const res = await fetch(url, {
        method: profileData ? "PATCH" : "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(profileData ? [body] : body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`저장 실패: ${err}`);
      }

      Alert.alert("✅ 저장 완료", "프로필이 저장되었습니다.");

      // ❗ goBack() 대신 메인 화면으로 이동
      navigation.navigate("Main");
    } catch (e: any) {
      console.error(e);
      Alert.alert("❌ 오류", e.message || "알 수 없는 오류");
    }
  };

  useEffect(() => {
    if (
      profileData?.certifications &&
      Array.isArray(profileData.certifications)
    ) {
      setCertifications(profileData.certifications);
    }
  }, [profileData]);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>
        {profileData ? "프로필 수정" : "프로필 등록"}
      </Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {imageUri || avatarUrl ? (
          <Image
            source={{ uri: imageUri || avatarUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>👤</Text>
          </View>
        )}
        <Text style={styles.changeText}>프로필 사진 선택</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder={`User ID: ${userId as string}`}
        editable={false}
        selectTextOnFocus={false} // 눌러도 포커스 안 가게
      />
      <TextInput
        style={styles.input}
        placeholder={`Email: ${user}`}
        editable={false}
        selectTextOnFocus={false} // 눌러도 포커스 안 가게
      />
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="이름 (실명)"
        value={fullName}
        onChangeText={setFullName}
      />
      <Text style={styles.label}>성별</Text>
      <View style={styles.genderContainer}>
        {["male", "female", ""].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.genderButton,
              gender === value && styles.genderButtonSelected,
            ]}
            onPress={() => setGender(value)}
          >
            <Text
              style={[
                styles.genderText,
                gender === value && styles.genderTextSelected,
              ]}
            >
              {value === "male"
                ? "남성"
                : value === "female"
                ? "여성"
                : "선택 안함"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>출생연도</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={birthYear}
          onValueChange={(itemValue) => setBirthYear(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="선택 안함" value="" />
          {years.map((year) => (
            <Picker.Item
              key={year}
              label={year.toString()}
              value={year.toString()}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>자격증</Text>
      <View style={styles.certPickerWrapper}>
        <View style={{ flex: 1 }}>
          <Picker
            selectedValue={selectedCert}
            onValueChange={(itemValue) => setSelectedCert(itemValue)}
            mode="dropdown"
          >
            <Picker.Item label="선택" value="" />
            {allCerts.map((cert) => (
              <Picker.Item key={cert} label={cert} value={cert} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity onPress={addCertification} style={styles.addButton}>
          <Text style={{ color: "#fff" }}>추가</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {certifications.map((cert) => (
          <View key={cert} style={styles.certBadge}>
            <Text style={styles.certText}>{cert}</Text>
            <TouchableOpacity onPress={() => removeCertification(cert)}>
              <Text style={styles.removeCert}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.label}>자기소개</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="소개글"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>저장하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
    // paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
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
  changeText: {
    marginTop: 6,
    color: "#007AFF",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
  },

  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },

  genderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  genderButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  genderText: {
    color: "#555",
    fontWeight: "bold",
  },

  genderTextSelected: {
    color: "#fff",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  certPickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
    borderWidth: 1, // ✅ 추가
    borderColor: "#ccc", // ✅ 추가
    borderRadius: 8, // ✅ 추가
    paddingHorizontal: 8, // 📦 여백도 살짝 넣으면 더 정리됨
  },

  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  certBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 4,
  },

  certText: {
    marginRight: 6,
    color: "#333",
  },

  removeCert: {
    fontWeight: "bold",
    color: "#999",
  },
});
