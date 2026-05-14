import { useEffect, useMemo, useRef, useState } from "react";

import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

import { SafeAreaView } from "react-native-safe-area-context";

import { onAuthStateChanged } from "firebase/auth";

import { MaterialIcons } from "@expo/vector-icons";

import { auth, db } from "../lib/firebase";

import { loginAnonymously } from "../lib/auth";

import { requestNotificationPermissions } from "../lib/notifications";

import { getUsername, saveUsername } from "../lib/user";

import { suggestedItems } from "../lib/suggestions";

import { Item } from "../types/item";

import { Activity } from "../types/activity";

import ActivityFeed from "../components/ActivityFeed";

import ItemCard from "../components/ItemCard";

import RoomJoinCard from "../components/RoomJoinCard";

import SuggestionsList from "../components/SuggestionsList";

import { setDoc } from "firebase/firestore";

import { getRoom, saveRoom } from "../lib/room";

export default function HomeScreen() {
  const [itemName, setItemName] = useState("");

  const [items, setItems] = useState<Item[]>([]);

  const [activities, setActivities] = useState<Activity[]>([]);

  const [roomId, setRoomId] = useState("");

  const [joinedRoom, setJoinedRoom] = useState("");

  const [username, setUsername] = useState("");

  const [savedUsername, setSavedUsername] = useState("");

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

        await requestNotificationPermissions();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await getUsername();

      if (storedUsername) {
        setSavedUsername(storedUsername);
      }
    };

    loadUsername();
  }, []);

  useEffect(() => {
    const loadRoom = async () => {
      const savedRoom = await getRoom();

      if (savedRoom) {
        setJoinedRoom(savedRoom);

        setRoomId(savedRoom);
      }
    };

    loadRoom();
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

  const handleSaveUsername = async () => {
    if (!username.trim()) return;

    await saveUsername(username);

    setSavedUsername(username);
  };

  const filteredSuggestions = useMemo(() => {
    if (!itemName.trim()) return suggestedItems;

    return suggestedItems.filter((item) =>
      item.toLowerCase().includes(itemName.toLowerCase()),
    );
  }, [itemName]);

  const addActivity = async (message: string) => {
    if (!joinedRoom) return;

    try {
      await addDoc(collection(db, "rooms", joinedRoom, "activities"), {
        message,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addItem = async (customItemName?: string) => {
    if (!joinedRoom) return;

    const finalItemName = customItemName || itemName;

    if (!finalItemName.trim()) return;

    try {
      await addDoc(collection(db, "rooms", joinedRoom, "items"), {
        name: finalItemName,
        status: "PENDING",
        addedBy: savedUsername,
        createdAt: serverTimestamp(),
      });

      await addActivity(`${savedUsername} added ${finalItemName}`);

      setItemName("");
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id: string, status: Item["status"]) => {
    try {
      await updateDoc(doc(db, "rooms", joinedRoom, "items", id), {
        status,
        updatedBy: savedUsername,
      });

      await addActivity(
        `${savedUsername} marked item as ${status.replaceAll("_", " ")}`,
      );
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

      await addActivity(
        `${savedUsername} suggested alternative ${alternative}`,
      );

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

  const joinRoom = async () => {
    if (!roomId.trim()) return;

    try {
      const roomRef = doc(db, "rooms", roomId.trim());

      await setDoc(
        roomRef,
        {
          roomName: roomId.trim(),
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      await setDoc(doc(db, "rooms", roomId.trim(), "members", savedUsername), {
        username: savedUsername,

        joinedAt: serverTimestamp(),
      });
      await saveRoom(roomId.trim());
      setJoinedRoom(roomId.trim());
    } catch (error) {
      console.log(error);
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
            {!savedUsername ? (
              <View className="mb-6 rounded-3xl bg-white p-5">
                <Text className="text-xl font-bold text-black">Your Name</Text>

                <TextInput
                  placeholder="Enter your name..."
                  value={username}
                  onChangeText={setUsername}
                  className="mt-4 rounded-2xl bg-gray-100 px-4 py-4"
                />

                <TouchableOpacity
                  onPress={handleSaveUsername}
                  className="mt-4 rounded-2xl bg-black py-4"
                >
                  <Text className="text-center font-semibold text-white">
                    Save Name
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-4">
                <Text className="font-medium text-gray-500">Logged in as</Text>

                <Text className="text-lg font-bold text-black">
                  {savedUsername}
                </Text>
              </View>
            )}

            <RoomJoinCard
              roomId={roomId}
              setRoomId={setRoomId}
              joinedRoom={joinedRoom}
              onJoin={joinRoom}
            />

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
                <Text className="font-semibold text-white">{items.length}</Text>
              </View>
            </View>

            <View className="mt-6 flex-row">
              <TextInput
                placeholder="Add grocery item..."
                value={itemName}
                onChangeText={setItemName}
                className="flex-1 rounded-l-2xl bg-white px-4 py-4 text-base"
              />

              <TouchableOpacity
                onPress={() => addItem()}
                className="items-center justify-center rounded-r-2xl bg-black px-6"
              >
                <Text className="font-semibold text-white">Add</Text>
              </TouchableOpacity>
            </View>

            <ActivityFeed activities={activities} />

            <Text className="mt-6 text-lg font-semibold text-black">
              Frequently Ordered
            </Text>

            <SuggestionsList
              suggestions={filteredSuggestions}
              onSelect={(value) => addItem(value)}
            />
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
          <ItemCard
            item={item}
            alternativeValue={alternativeInputs[item.id] || ""}
            onAlternativeChange={(text) =>
              setAlternativeInputs((prev) => ({
                ...prev,
                [item.id]: text,
              }))
            }
            onBought={() => updateStatus(item.id, "BOUGHT")}
            onOutOfStock={() => updateStatus(item.id, "OUT_OF_STOCK")}
            onAddAlternative={() => addAlternative(item.id)}
            getStatusColor={getStatusColor}
          />
        )}
      />
    </SafeAreaView>
  );
}
