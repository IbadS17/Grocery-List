import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-5 pt-10">
        <Text className="text-3xl font-bold text-black">Settings</Text>

        <Text className="mt-2 text-gray-500">Manage your account and room</Text>
      </View>
    </SafeAreaView>
  );
}
