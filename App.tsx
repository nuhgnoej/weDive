import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./Navigators/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./Context/AuthContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
