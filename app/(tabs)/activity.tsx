import { FlatList, Text, View } from "react-native";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../lib/firebase";

import { Activity } from "../../types/activity";

import { useRoomStore } from "../../store/useRoomStore";

export default function ActivityScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const { joinedRoom } = useRoomStore();

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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
        }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-black">Activity</Text>

            <Text className="mt-2 text-gray-500">Live room updates</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-3xl bg-white p-5">
            <Text className="text-base text-gray-700">{item.message}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
