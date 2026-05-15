import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";

import { db } from "../../lib/firebase";

import { Item } from "../../types/item";

import { useRoomStore } from "../../store/useRoomStore";

export default function HistoryScreen() {
  const [historyItems, setHistoryItems] = useState<Item[]>([]);

  const { joinedRoom } = useRoomStore();

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

      setHistoryItems(fetchedItems);
    });

    return () => unsubscribe();
  }, [joinedRoom]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
        }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-black">History</Text>

            <Text className="mt-2 text-gray-500">Archived grocery items</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-3xl bg-white p-5">
            <Text className="text-xl font-semibold text-black">
              {item.name}
            </Text>

            {item.quantity ? (
              <Text className="mt-1 text-gray-500">
                {item.quantity} {item.unit}
              </Text>
            ) : null}

            <Text className="mt-2 text-gray-400">Added by {item.addedBy}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
