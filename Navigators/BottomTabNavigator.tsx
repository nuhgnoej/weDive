import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../Screens/Main/HomeScreen";
import MatchingScreen from "../Screens/Main/MatchingScreen";
import CommunityScreen from "../Screens/Main/CommunityScreen";
import ProfileScreen from "../Screens/Main/ProfileScreen";
import { Button } from "react-native";
import { useAuth } from "../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../lib/navigator";
import ChatRoomsScreen from "../Screens/Main/ChatRoomsScreen";
import ChatScreen from "../Screens/ChatScreen";

export default function BottomTabNavigator() {
  const Tab = createBottomTabNavigator();
  const { user, logOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // 아이콘 설정
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Matching") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "ChatRooms") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          } else if (route.name === "Community") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },

        // 공통 스타일
        tabBarActiveTintColor: "#007AFF", // 활성화 색상
        tabBarInactiveTintColor: "#8e8e93", // 비활성 색상
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1.3,
          borderTopColor: "#dcdcdc",
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 5,
        },
        headerShown: false, // 각 스크린의 헤더는 숨김 (필요시 각 스크린에서 따로 지정)
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: "홈",
          headerRight: () => (
            <Button
              title={user ? "로그아웃" : "로그인"}
              onPress={() => {
                if (user) {
                  logOut();
                } else {
                  navigation.navigate("Login");
                }
              }}
            />
          ),
        }}
      />
      <Tab.Screen name="Matching" component={MatchingScreen} />
      <Tab.Screen name="ChatRooms" component={ChatRoomsScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}
