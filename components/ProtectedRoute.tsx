// components/ProtectedRoute.tsx
import React, { JSX } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../lib/navigator";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (!isLoading && !user) {
      navigation.navigate("Login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return user ? children : null;
}
