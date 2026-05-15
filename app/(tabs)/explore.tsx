import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../lib/firebase";

import { Item } from "../../types/item";

import { useRoomStore } from "../../store/useRoomStore";

export default function ExploreScreen() {
  const [items, setItems] = useState<Item[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilter, setSelectedFilter] = useState<
    "ALL" | "PENDING" | "BOUGHT" | "OUT_OF_STOCK"
  >("ALL");

  const { joinedRoom } = useRoomStore();

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "items"),

      where("archived", "!=", true),

      orderBy("archived"),

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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesFilter = true;

      if (selectedFilter === "PENDING") {
        matchesFilter = item.status === "PENDING";
      }

      if (selectedFilter === "BOUGHT") {
        matchesFilter = item.status === "BOUGHT";
      }

      if (selectedFilter === "OUT_OF_STOCK") {
        matchesFilter = item.status === "OUT_OF_STOCK";
      }

      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, selectedFilter]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View>
            <Text className="text-3xl font-bold text-black">Explore</Text>

            <Text className="mt-2 text-gray-500">
              Search and filter grocery items
            </Text>

            <TextInput
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="mt-6 rounded-2xl bg-white px-4 py-4"
            />

            <FlatList
              horizontal
              data={["ALL", "PENDING", "BOUGHT", "OUT_OF_STOCK"]}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              className="mt-4"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedFilter(item as any)}
                  className={`mr-3 rounded-2xl px-5 py-3 ${
                    selectedFilter === item ? "bg-black" : "bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedFilter === item ? "text-white" : "text-black"
                    }`}
                  >
                    {item.replaceAll("_", " ")}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View className="mt-4 rounded-3xl bg-white p-5">
            <Text className="text-xl font-semibold text-black">
              {item.name}
            </Text>

            {item.quantity ? (
              <Text className="mt-1 text-gray-500">
                {item.quantity} {item.unit}
              </Text>
            ) : null}

            <Text className="mt-2 font-medium text-gray-500">
              {item.status.replaceAll("_", " ")}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
