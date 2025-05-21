import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import { PostCategories } from "./PostCategories";

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("자유");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("❌ 오류", "제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access_token");
      const userId = await AsyncStorage.getItem("user_id");

      const res = await fetch(`${SUPABASE_API_URL}/rest/v1/posts`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          title,
          content,
          category,
          user_id: userId,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      Alert.alert("✅ 등록 완료", "게시글이 등록되었습니다.");
      navigation.goBack(); // 또는 navigation.navigate("PostDetail", { postId: newPostId })
    } catch (err) {
      console.error(err);
      Alert.alert("❌ 오류", "게시글 등록에 실패했습니다.");
    }
  };
  const PostCategoriesArr = PostCategories;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>카테고리</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        {PostCategoriesArr.map((c) => (
          <Picker.Item label={c} value={c} key={c} />
        ))}
        {/* <Picker.Item label="자유" value="자유" />
        <Picker.Item label="후기" value="후기" />
        <Picker.Item label="Q&A" value="Q&A" />
        <Picker.Item label="장터" value="장터" />
        <Picker.Item label="지역" value="지역" /> */}
      </Picker>

      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목을 입력하세요"
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, { height: 150, textAlignVertical: "top" }]}
        value={content}
        onChangeText={setContent}
        placeholder="내용을 입력하세요"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>등록하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
