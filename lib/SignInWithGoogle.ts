// lib/signInWithGoogle.ts
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { API_KEY, SUPABASE_API_URL } from "../config/config";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectUri = Linking.createURL("auth/callback");

  const authUrl = `${SUPABASE_API_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    redirectUri
  )}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== "success" || !result.url) {
    throw new Error("Google 로그인 취소됨 또는 실패");
  }

  const url = new URL(result.url);
  const accessToken = url.hash
    .substring(1)
    .split("&")
    .find((x) => x.startsWith("access_token="))
    ?.split("=")[1];

  if (!accessToken) throw new Error("액세스 토큰을 찾을 수 없습니다");

  const userRes = await fetch(`${SUPABASE_API_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: API_KEY,
    },
  });

  const user = await userRes.json();
  return { accessToken, user };
}
