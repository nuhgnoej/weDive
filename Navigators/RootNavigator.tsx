import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DetailScreen from "../Screens/DetailScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import LoginScreen from "../Screens/LoginScreen";
import SignUpScreen from "../Screens/SignUpScreen";
import CreateMatchRoomScreen from "../Screens/CreateMatchRoomScreen";
import ChatRoomScreen from "../Screens/ChatRoom";
import { SafeAreaView } from "react-native-safe-area-context";
import EditProfileScreen from "../Screens/EditProfileScreen";

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
      </Stack.Navigator>
    </SafeAreaView>
  );
}
