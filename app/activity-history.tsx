import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { useEffect, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { db } from "../lib/firebase";

import { Activity } from "../types/activity";

import { useRoomStore } from "../store/useRoomStore";

export default function ActivityHistoryScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const { joinedRoom } = useRoomStore();

  const router = useRouter();

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "activities"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedActivities: Activity[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<Activity, "id">),
      }));

      setActivities(fetchedActivities);
    });

    return () => unsubscribe();
  }, [joinedRoom]);

  const groupedActivities = activities.reduce(
    (acc, activity) => {
      const date =
        activity.createdAt?.toDate?.()?.toLocaleDateString?.() ||
        "Unknown Date";

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(activity);

      return acc;
    },
    {} as Record<string, Activity[]>,
  );

  const groupedData = Object.entries(groupedActivities);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="border-b border-gray-200 bg-white px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-semibold text-black">
          Activity History
        </Text>
      </View>
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item[0]}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => {
          const [date, activities] = item;

          return (
            <View className="mb-6">
              <Text className="mb-3 text-lg font-bold text-black">{date}</Text>

              {activities.map((activity) => (
                <View
                  key={activity.id}
                  className="mb-3 rounded-3xl bg-white p-5"
                >
                  <Text className="text-gray-700">{activity.message}</Text>
                </View>
              ))}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
