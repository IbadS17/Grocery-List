import { useEffect, useMemo, useRef, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../lib/firebase";

import { loginAnonymously } from "../lib/auth";

import { Item } from "../types/item";

import { suggestedItems } from "../lib/suggestions";

export default function HomeScreen() {
  const [itemName, setItemName] = useState("");

  const [items, setItems] = useState<Item[]>([]);

  const [roomId, setRoomId] = useState("");

  const [joinedRoom, setJoinedRoom] = useState("");

  const [alternativeInputs, setAlternativeInputs] = useState<
    Record<string, string>
  >({});

  const hasLoggedIn = useRef(false);

  useEffect(() => {
    if (hasLoggedIn.current) return;

    hasLoggedIn.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await loginAnonymously();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "items"),
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

  const filteredSuggestions = useMemo(() => {
    if (!itemName.trim()) return suggestedItems;

    return suggestedItems.filter((item) =>
      item.toLowerCase().includes(itemName.toLowerCase()),
    );
  }, [itemName]);

  const addItem = async (customItemName?: string) => {
    if (!joinedRoom) return;

    const finalItemName = customItemName || itemName;

    if (!finalItemName.trim()) return;

    try {
      await addDoc(collection(db, "rooms", joinedRoom, "items"), {
        name: finalItemName,
        status: "PENDING",
        createdAt: serverTimestamp(),
      });

      setItemName("");
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id: string, status: Item["status"]) => {
    try {
      await updateDoc(doc(db, "rooms", joinedRoom, "items", id), {
        status,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addAlternative = async (id: string) => {
    const alternative = alternativeInputs[id];

    if (!alternative?.trim()) return;

    try {
      await updateDoc(doc(db, "rooms", joinedRoom, "items", id), {
        alternative,
      });

      setAlternativeInputs((prev) => ({
        ...prev,
        [id]: "",
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (status: Item["status"]) => {
    switch (status) {
      case "BOUGHT":
        return "text-green-600";

      case "OUT_OF_STOCK":
        return "text-red-600";

      default:
        return "text-yellow-600";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View className="px-5 pt-10">
            <View className="mb-6 rounded-3xl bg-white p-5">
              <Text className="text-xl font-bold text-black">
                Join Family Room
              </Text>

              <TextInput
                placeholder="Enter room code..."
                value={roomId}
                onChangeText={setRoomId}
                className="mt-4 rounded-2xl bg-gray-100 px-4 py-4"
              />

              <TouchableOpacity
                onPress={() => setJoinedRoom(roomId.trim())}
                className="mt-4 rounded-2xl bg-black py-4"
              >
                <Text className="text-center font-semibold text-white">
                  Join Room
                </Text>
              </TouchableOpacity>

              {joinedRoom ? (
                <Text className="mt-3 font-medium text-green-600">
                  Joined Room: {joinedRoom}
                </Text>
              ) : null}
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-black">
                  Grocery Queue
                </Text>

                <Text className="mt-2 text-gray-500">
                  Real-time family shopping assistant
                </Text>
              </View>

              {joinedRoom ? (
                <View className="rounded-2xl bg-green-100 px-4 py-2">
                  <Text className="font-semibold text-green-700">
                    {joinedRoom}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-black">
                Shopping Items
              </Text>

              <View className="rounded-xl bg-black px-3 py-1">
                <Text className="text-white font-semibold">{items.length}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <MaterialIcons name="shopping-cart" size={70} color="#d1d5db" />

            <Text className="mt-5 text-2xl font-bold text-gray-400">
              No Items Yet
            </Text>

            <Text className="mt-2 text-center text-gray-400">
              Add your first grocery item to start collaborating with family
              members.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-xl font-semibold text-black">
                  {item.name}
                </Text>

                <Text
                  className={`mt-2 font-medium ${getStatusColor(item.status)}`}
                >
                  {item.status.replaceAll("_", " ")}
                </Text>
              </View>

              <MaterialIcons
                name={
                  item.status === "BOUGHT"
                    ? "check-circle"
                    : item.status === "OUT_OF_STOCK"
                      ? "cancel"
                      : "access-time"
                }
                size={28}
                color={
                  item.status === "BOUGHT"
                    ? "green"
                    : item.status === "OUT_OF_STOCK"
                      ? "red"
                      : "#ca8a04"
                }
              />
            </View>

            {item.alternative && (
              <View className="mt-4 rounded-2xl bg-blue-50 p-4">
                <Text className="font-semibold text-blue-700">
                  Suggested Alternative
                </Text>

                <Text className="mt-1 text-blue-600">{item.alternative}</Text>
              </View>
            )}

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                onPress={() => updateStatus(item.id, "BOUGHT")}
                className="flex-1 rounded-2xl bg-green-500 py-4"
              >
                <Text className="text-center font-semibold text-white">
                  Bought
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateStatus(item.id, "OUT_OF_STOCK")}
                className="flex-1 rounded-2xl bg-red-500 py-4"
              >
                <Text className="text-center font-semibold text-white">
                  Out Of Stock
                </Text>
              </TouchableOpacity>
            </View>

            {item.status === "OUT_OF_STOCK" && (
              <View className="mt-4">
                <TextInput
                  placeholder="Suggest alternative..."
                  value={alternativeInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setAlternativeInputs((prev) => ({
                      ...prev,
                      [item.id]: text,
                    }))
                  }
                  className="rounded-2xl bg-gray-100 px-4 py-4"
                />

                <TouchableOpacity
                  onPress={() => addAlternative(item.id)}
                  className="mt-3 rounded-2xl bg-blue-500 py-4"
                >
                  <Text className="text-center font-semibold text-white">
                    Add Alternative
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
