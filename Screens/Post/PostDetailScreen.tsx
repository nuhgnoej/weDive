// screens/Post/PostDetailScreen.tsx
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function PostDetailScreen() {
  const route = useRoute<any>();
  const { postId } = route.params;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchPost();
      fetchComments();
      fetchLikes();
    }, [postId])
  );
  const toggleLike = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const userId = await AsyncStorage.getItem("user_id");

    if (liked) {
      // 좋아요 취소
      await fetch(
        `${SUPABASE_API_URL}/rest/v1/likes?post_id=eq.${postId}&user_id=eq.${userId}`,
        {
          method: "DELETE",
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      // 좋아요 추가
      await fetch(`${SUPABASE_API_URL}/rest/v1/likes`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
        }),
      });
    }

    fetchLikes(); // 갱신
  };

  const fetchLikes = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const userId = await AsyncStorage.getItem("user_id");

    const res = await fetch(
      `${SUPABASE_API_URL}/rest/v1/likes?post_id=eq.${postId}&select=*`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    setLikeCount(data.length);
    setLiked(data.some((item) => item.user_id === userId));
  };
  // ✅ 댓글 가져오기
  const fetchComments = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const res = await fetch(
      `${SUPABASE_API_URL}/rest/v1/comments?post_id=eq.${postId}&select=*,profile:profiles(nickname)&order=created_at.asc`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    setComments(data);
  };

  // ✅ 댓글 등록
  const handleAddComment = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const userId = await AsyncStorage.getItem("user_id");

    if (!comment.trim()) return;

    const res = await fetch(`${SUPABASE_API_URL}/rest/v1/comments`, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        post_id: postId,
        user_id: userId,
        content: comment,
      }),
    });

    if (res.ok) {
      setComment("");
      fetchComments(); // 다시 불러오기
    }
  };

  const fetchPost = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `${SUPABASE_API_URL}/rest/v1/posts?select=*,profile:profiles(nickname)&id=eq.${postId}`,
        {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setPost(data[0]);
    } catch (err) {
      console.error("❌ 게시글 로딩 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.commentItem}>
          <Text style={styles.commentAuthor}>
            {item.profile?.nickname || "익명"}
          </Text>
          <Text>{item.content}</Text>
          <Text style={styles.commentDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.author}>
              🧑 {post.profile?.nickname || "익명"}
            </Text>
            <Text style={styles.date}>
              🕓 {new Date(post.created_at).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.content}>{post.content}</Text>

          <TouchableOpacity
            onPress={toggleLike}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 12,
            }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={24}
              color={liked ? "#FF3B30" : "#888"}
              style={{ marginRight: 6 }}
            />
            <Text>{likeCount}명 좋아요</Text>
          </TouchableOpacity>

          {/* 댓글 입력창 */}
          <View style={styles.commentInputBox}>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="댓글을 입력하세요"
            />
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.commentButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>등록</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 20 }}>
            💬 댓글
          </Text>
        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <Text style={{ color: "#888", marginTop: 20 }}>
          아직 댓글이 없습니다.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  author: {
    fontSize: 14,
    color: "#007AFF",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  commentInputBox: {
    flexDirection: "row",
    padding: 10,
    marginTop: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  commentItem: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
