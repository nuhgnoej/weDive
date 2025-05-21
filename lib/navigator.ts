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
  SignUp: undefined;
  CreateMatchRoom: undefined;
  EditProfile: { profile?: any } | undefined;
  RoomDetail: { roomId: string };
  RoomApplicants: { roomId: string };
  CreatePost: undefined;
  PostDetail: { postId: string };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
