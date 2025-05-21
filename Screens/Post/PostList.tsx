// screens/Post/PostList.tsx
import { useState, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_KEY, SUPABASE_API_URL } from "../../config/config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NavigationProp } from "../../lib/navigator";
import { Ionicons } from "@expo/vector-icons";

export default function PostList({ category }: { category: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [category])
  );

  const fetchPosts = async () => {
    const token = await AsyncStorage.getItem("access_token");
    const filter = category === "전체" ? "" : `&category=eq.${category}`;
    const res = await fetch(
      `${SUPABASE_API_URL}/rest/v1/posts?select=*,likes(count),comments(count)&order=created_at.desc${filter}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "count=exact",
        },
      }
    );
    const data = await res.json();
    setPosts(data);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postCard}
            onPress={() =>
              navigation.navigate("PostDetail", { postId: item.id })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>
              {item.content}
            </Text>

            <View style={styles.iconRow}>
              <Ionicons name="heart-outline" size={16} color="#888" />
              <Text style={styles.iconText}>{item.likes?.length || 0}</Text>

              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#888"
                style={{ marginLeft: 12 }}
              />
              <Text style={styles.iconText}>{item.comments?.length || 0}</Text>
            </View>

            <Text style={styles.postDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        }
        contentContainerStyle={
          posts.length === 0
            ? [styles.listContent, { flex: 1, justifyContent: "center" }]
            : styles.listContent
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#222",
  },
  postContent: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },
  postDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  iconText: {
    marginLeft: 4,
    marginRight: 8,
    fontSize: 13,
    color: "#555",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  emptyWrapper: {
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    marginTop: 8,
  },
});
