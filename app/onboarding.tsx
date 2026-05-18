import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { getUsername, saveUsername } from "../lib/user";

import { getRoom, saveRoom } from "../lib/room";

import { saveRole } from "../lib/role";
import { useRoomStore } from "../store/useRoomStore";

export default function OnboardingScreen() {
  const [username, setUsername] = useState("");

  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState<"SENDER" | "BUYER">("BUYER");

  const { setJoinedRoom } = useRoomStore();

  useEffect(() => {
    const redirectIfSetupExists = async () => {
      const storedUsername = await getUsername();
      const storedRoom = await getRoom();

      if (storedUsername && storedRoom) {
        router.replace("/");
      }
    };

    redirectIfSetupExists();
  }, []);

  const handleContinue = async () => {
    if (!username.trim()) return;

    if (!roomId.trim()) return;

    const usernameSaved = await saveUsername(username);
    const roomSaved = await saveRoom(roomId);
    await saveRole(role);

    if (!usernameSaved || !roomSaved) {
      Alert.alert(
        "Unable to continue",
        "We could not save your name or room code. Please try again.",
      );
      return;
    }

    setJoinedRoom(roomId);

    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 justify-center px-6">
        <View className="rounded-3xl bg-white p-6">
          <Text className="text-3xl font-bold text-black">Grocery Queue</Text>

          <Text className="mt-2 text-gray-500">
            Real-time family shopping assistant
          </Text>

          <View className="mt-8">
            <Text className="mb-2 font-semibold text-black">Your Name</Text>

            <TextInput
              placeholder="Enter your name"
              value={username}
              onChangeText={setUsername}
              className="rounded-2xl bg-gray-100 px-4 py-4"
            />
          </View>

          <View className="mt-5">
            <Text className="mb-2 font-semibold text-black">
              Family Room Code
            </Text>

            <TextInput
              placeholder="Enter room code"
              value={roomId}
              onChangeText={setRoomId}
              className="rounded-2xl bg-gray-100 px-4 py-4"
            />
          </View>

          <View className="mt-6">
            <Text className="mb-3 font-semibold text-black">Select Role</Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setRole("BUYER")}
                className={`flex-1 rounded-2xl py-4 ${
                  role === "BUYER" ? "bg-black" : "bg-white"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === "BUYER" ? "text-white" : "text-black"
                  }`}
                >
                  Buyer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole("SENDER")}
                className={`flex-1 rounded-2xl py-4 ${
                  role === "SENDER" ? "bg-black" : "bg-white"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === "SENDER" ? "text-white" : "text-black"
                  }`}
                >
                  Sender
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            className="mt-6 rounded-2xl bg-blue-500 px-4 py-4"
          >
            <Text className="text-center text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
