import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { db } from "../lib/firebase";

import { Item } from "../types/item";

import { useRoomStore } from "../store/useRoomStore";

export default function ArchivedHistoryScreen() {
  const [items, setItems] = useState<Item[]>([]);

  const { joinedRoom } = useRoomStore();

  const router = useRouter();

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "items"),

      where("archived", "==", true),

      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems: Item[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<Item, "id">),
      }));

      setItems(fetchedItems);
    });

    return () => unsubscribe();
  }, [joinedRoom]);

  const groupedItems = items.reduce(
    (acc, item) => {
      const date =
        item.createdAt?.toDate?.()?.toLocaleDateString?.() || "Unknown Date";

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(item);

      return acc;
    },
    {} as Record<string, Item[]>,
  );

  const groupedData = Object.entries(groupedItems);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="border-b border-gray-200 bg-white px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-semibold text-black">
          Archived Items
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
          const [date, items] = item;

          return (
            <View className="mb-6">
              <Text className="mb-3 text-lg font-bold text-black">{date}</Text>

              {items.map((historyItem) => (
                <View
                  key={historyItem.id}
                  className="mb-3 rounded-3xl bg-white p-5"
                >
                  <Text className="text-xl font-semibold text-black">
                    {historyItem.name}
                  </Text>

                  {historyItem.quantity ? (
                    <Text className="mt-1 text-gray-500">
                      {historyItem.quantity} {historyItem.unit}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
