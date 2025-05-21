// screens/CommunityScreen.tsx
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PostList from "../Post/PostList";
import { PostCategories } from "../Post/PostCategories";

const Tab = createMaterialTopTabNavigator();

export default function CommunityScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarScrollEnabled: true, // 탭 많을 때 스크롤 허용
        tabBarIndicatorStyle: { backgroundColor: "#007AFF" },
        tabBarLabelStyle: { fontWeight: "bold" },
        tabBarItemStyle: { width: "auto", paddingHorizontal: 16 }, // ✅ 핵심: 자동 너비 + 적당한 padding
      }}
    >
      <Tab.Screen name="전체" children={() => <PostList category="전체" />} />
      {PostCategories.map((c) => (
        <Tab.Screen
          key={c}
          name={c}
          children={() => <PostList category={c} />}
        />
      ))}
    </Tab.Navigator>
  );
}
