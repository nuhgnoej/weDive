import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextType = {
  user: string | null;
  userId: string | null;
  accessToken: string | null;
  logIn: (token: string, email: string, userId: string) => Promise<void>; // ✅ userId 인자 추가
  logOut: () => Promise<void>;
  isLoading: boolean;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await AsyncStorage.getItem("access_token");
      const email = await AsyncStorage.getItem("user_email");
      const userId = await AsyncStorage.getItem("user_id");

      if (token && email && userId) {
        setAccessToken(token);
        setUser(email);
        setUserId(userId); // ✅ 꼭 필요
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const logIn = async (token: string, email: string, userId: string) => {
    await AsyncStorage.setItem("access_token", token);
    await AsyncStorage.setItem("user_email", email);
    await AsyncStorage.setItem("user_id", userId);
    setAccessToken(token);
    setUser(email);
    setUserId(userId); // ✅ 상태도 같이 설정
  };

  const logOut = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user_email");
    await AsyncStorage.removeItem("user_id"); // ✅ 지울 때도 잊지 말기
    setAccessToken(null);
    setUser(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userId, accessToken, logIn, logOut, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
