import { useNavigation } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";
import { NavigationProp } from "../lib/navigator";

export default function DetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const handlePressGoDetail = () => {
    console.log("Pressed!");
    navigation.navigate("Detail");
  };
  const handlePressGoProfile = () => {
    console.log("Pressed!");
    navigation.navigate("Profile");
  };
  const handlePressGoHome = () => {
    console.log("Pressed!");
    navigation.navigate("Main");
  };
  return (
    <View>
      <Text>This is Detail</Text>
      <TouchableOpacity onPress={handlePressGoProfile}>
        <Text>"Go to Profile"</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressGoHome}>
        <Text>"Go to Home"</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePressGoDetail}>
        <Text>"Go to Detail"</Text>
      </TouchableOpacity>
    </View>
  );
}
