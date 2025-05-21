import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DetailScreen from "../Screens/DetailScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import LoginScreen from "../Screens/LoginScreen";
import SignUpScreen from "../Screens/SignUpScreen";
import CreateMatchRoomScreen from "../Screens/CreateMatchRoomScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import EditProfileScreen from "../Screens/EditProfileScreen";
import ChatRoomScreen from "../Screens/ChatRoomScreen";
import RoomDetailScreen from "../Screens/RoomDetailScreen";
import RoomApplicantsScreen from "../Screens/RoomApplicantsScreen";
import CreatePostScreen from "../Screens/Post/CreatePostScreen";
import PostDetailScreen from "../Screens/Post/PostDetailScreen";

export default function RootNavigator() {
  const Stack = createNativeStackNavigator();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="CreateMatchRoom"
          component={CreateMatchRoomScreen}
        />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
        <Stack.Screen name="RoomApplicants" component={RoomApplicantsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}
