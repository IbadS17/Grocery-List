import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import { saveUsername } from "../lib/user";

import { saveRoom } from "../lib/room";

import { useRoomStore } from "../store/useRoomStore";

export default function OnboardingScreen() {
  const [username, setUsername] = useState("");

  const [roomId, setRoomId] = useState("");

  const { setJoinedRoom } = useRoomStore();

  const handleContinue = async () => {
    if (!username.trim()) return;

    if (!roomId.trim()) return;

    await saveUsername(username);

    await saveRoom(roomId);

    setJoinedRoom(roomId);

    router.replace("/(tabs)");
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
