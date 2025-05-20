import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Main: undefined;
  Detail: undefined;
  Profile: undefined;
  Home: undefined;
  Login: undefined;
  Matching: undefined;
  ChatRooms: undefined;
  ChatRoom: { roomId: string };
  Community: undefined;
  SignIn: undefined;
  CreateMatchRoom: undefined;
  EditProfile: { profile?: any } | undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
