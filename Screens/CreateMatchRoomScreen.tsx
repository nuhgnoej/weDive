import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Context/AuthContext";
import { API_KEY, SUPABASE_API_URL } from "../config/config";

export default function CreateRoomScreen() {
  const navigation = useNavigation();
  const { userId } = useAuth();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxPeople, setMaxPeople] = useState("2");
  const [licenseRequired, setLicenseRequired] = useState("");
  const [gearRequired, setGearRequired] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("freediving");
  const [meetTime, setMeetTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [meetPoint, setMeetPoint] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token || !userId) throw new Error("인증 정보가 없습니다.");

      // 1. 방 생성
      const roomRes = await fetch(`${SUPABASE_API_URL}/rest/v1/rooms`, {
        method: "POST",
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation", // 생성된 방 정보를 바로 받음
        },
        body: JSON.stringify([
          {
            creator_id: userId,
            title,
            location,
            date: date.toISOString().split("T")[0],
            max_people: parseInt(maxPeople),
            license_required: licenseRequired,
            gear_required: gearRequired,
            description,
            type,
            meet_time: meetTime.toISOString().split("T")[1].slice(0, 5),
            meet_point: meetPoint,
            public: isPublic,
          },
        ]),
      });

      const roomData = await roomRes.json();
      if (!roomRes.ok) throw new Error(roomData?.message || "방 생성 실패");

      const newRoom = roomData[0]; // ✅ 방 정보에서 room_id 추출

      // 2. 방장 자신을 참가자로 등록 (status: approved)
      const participantRes = await fetch(
        `${SUPABASE_API_URL}/rest/v1/participants`,
        {
          method: "POST",
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              room_id: newRoom.id,
              user_id: userId,
              status: "approved",
            },
          ]),
        }
      );

      if (!participantRes.ok) {
        const errText = await participantRes.text();
        throw new Error(`방장은 참가자로 등록되지 않았습니다.\n${errText}`);
      }

      // ✅ 성공 후 화면 이동
      navigation.goBack();
    } catch (error) {
      console.error("❌ 방 생성 실패:", error);
      alert(error.message || "방 생성 실패");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>방 제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="예: 5/30 제주 프리다이빙"
      />

      <Text style={styles.label}>장소</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="예: 제주 김녕해수욕장"
      />

      <Text style={styles.label}>일정</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.pickerButton}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>집결 시간</Text>
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <Text style={styles.pickerButton}>
          {meetTime.toTimeString().slice(0, 5)}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={meetTime}
          mode="time"
          is24Hour
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selectedTime) setMeetTime(selectedTime);
          }}
        />
      )}

      <Text style={styles.label}>모집 인원</Text>
      <TextInput
        style={styles.input}
        value={maxPeople}
        onChangeText={setMaxPeople}
        keyboardType="numeric"
      />

      <Text style={styles.label}>요구 자격증</Text>
      <TextInput
        style={styles.input}
        value={licenseRequired}
        onChangeText={setLicenseRequired}
        placeholder="예: AIDA 2 이상"
      />

      <Text style={styles.label}>다이빙 종류</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="예: freediving / scuba"
      />

      <Text style={styles.label}>장비 필수 여부</Text>
      <View style={styles.switchRow}>
        <Text>{gearRequired ? "필수" : "불필요"}</Text>
        <Switch value={gearRequired} onValueChange={setGearRequired} />
      </View>

      <Text style={styles.label}>집결 위치</Text>
      <TextInput
        style={styles.input}
        value={meetPoint}
        onChangeText={setMeetPoint}
        placeholder="예: 사천진항 입구"
      />

      <Text style={styles.label}>설명</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="기타 안내사항을 입력해주세요"
      />

      <Text style={styles.label}>공개 여부</Text>
      <View style={styles.switchRow}>
        <Text>{isPublic ? "공개" : "비공개"}</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>방 생성</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginTop: 8,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
