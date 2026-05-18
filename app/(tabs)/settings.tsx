import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRoom } from "../../lib/room";

import { getUsername } from "../../lib/user";

import { useEffect, useState } from "react";

import { useThemeStore } from "../../store/useThemeStore";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Switch } from "react-native";

import { router } from "expo-router";

export default function SettingsScreen() {
  const [username, setUsername] = useState("");

  const [room, setRoom] = useState("");

  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    const loadData = async () => {
      const storedUsername = await getUsername();
      const storedRoom = await getRoom();

      if (storedUsername) {
        setUsername(storedUsername);
      }

      if (storedRoom) {
        setRoom(storedRoom);
      }
    };

    loadData();
  }, []);

  const resetApp = async () => {
    await AsyncStorage.clear();

    router.replace("/onboarding");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-5 pt-10">
        <Text className="text-3xl font-bold text-black">Settings</Text>

        <Text className="mt-2 text-gray-500">Manage your account and room</Text>

        <View className="mt-8 rounded-3xl bg-white p-5">
          <Text className="text-gray-500">Username</Text>

          <Text className="mt-1 text-xl font-bold text-black">{username}</Text>
        </View>

        <View className="mt-4 rounded-3xl bg-white p-5">
          <Text className="text-gray-500">Joined Room</Text>

          <Text className="mt-1 text-xl font-bold text-black">{room}</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("../activity-history")}
          className="mt-4 rounded-3xl bg-white p-5"
        >
          <Text className="text-xl font-semibold text-black">
            Activity History
          </Text>

          <Text className="mt-1 text-gray-500">
            View realtime activity logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("../archived-history")}
          className="mt-4 rounded-3xl bg-white p-5"
        >
          <Text className="text-xl font-semibold text-black">
            Archived Items
          </Text>

          <Text className="mt-1 text-gray-500">
            View archived grocery history
          </Text>
        </TouchableOpacity>

        <View className="mt-4 rounded-3xl bg-white p-5 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-semibold text-black">Dark Mode</Text>

            <Text className="mt-1 text-gray-500">App theme appearance</Text>
          </View>

          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <TouchableOpacity
          className="mt-8 rounded-3xl bg-red-500 p-5"
          onPress={resetApp}
        >
          <Text className="text-center text-white">Reset App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
