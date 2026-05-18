import { useEffect, useMemo, useRef, useState } from "react";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
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

import { MaterialIcons } from "@expo/vector-icons";

import { auth, db } from "../../lib/firebase";

import { loginAnonymously } from "../../lib/auth";

import { requestNotificationPermissions } from "../../lib/notifications";

import { getUsername, saveUsername } from "../../lib/user";

import { Item } from "../../types/item";

import { Activity } from "../../types/activity";

import ItemCard from "../../components/ItemCard";

import SuggestionsList from "../../components/SuggestionsList";

import { setDoc } from "firebase/firestore";

import { getRoom, saveRoom } from "../../lib/room";

import { units } from "../../lib/units";

import { sendRoleBasedNotification } from "../../lib/notifications";
import { useRoomStore } from "../../store/useRoomStore";

import { getRole } from "@/lib/role";
import { RequestItem } from "../../types/request";

export default function HomeScreen() {
  const [itemName, setItemName] = useState("");

  const [quantity, setQuantity] = useState("");

  const [selectedUnit, setSelectedUnit] = useState("pcs");

  const [items, setItems] = useState<Item[]>([]);

  const [activities, setActivities] = useState<Activity[]>([]);

  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const [historyItems, setHistoryItems] = useState<string[]>([]);

  const [roomId, setRoomId] = useState("");

  const { joinedRoom, setJoinedRoom } = useRoomStore();

  const [username, setUsername] = useState("");

  const [savedUsername, setSavedUsername] = useState("");

  const [alternativeInputs, setAlternativeInputs] = useState<
    Record<string, string>
  >({});

  const [role, setRole] = useState("");

  const [requests, setRequests] = useState<RequestItem[]>([]);

  const hasLoggedIn = useRef(false);

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await getRole();

      if (storedRole) {
        setRole(storedRole);
      }
    };

    loadRole();
  }, []);

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "requests"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: RequestItem[] = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<RequestItem, "id">),
      }));

      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, [joinedRoom]);

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

      where("archived", "==", false),

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

  useEffect(() => {
    if (!joinedRoom) return;

    const q = query(
      collection(db, "rooms", joinedRoom, "history"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => doc.data().name as string);

      setHistoryItems(history);
    });

    return () => unsubscribe();
  }, [joinedRoom]);

  const handleSaveUsername = async () => {
    if (!username.trim()) return;

    await saveUsername(username);

    setSavedUsername(username);
  };

  useEffect(() => {
    if (!historyItems.length) return;

    const frequencyMap: Record<string, number> = {};

    historyItems.forEach((name) => {
      const normalizedName = name.toLowerCase();

      if (frequencyMap[normalizedName]) {
        frequencyMap[normalizedName] += 1;
      } else {
        frequencyMap[normalizedName] = 1;
      }
    });

    const sortedSuggestions = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
      });

    setSmartSuggestions(sortedSuggestions);
  }, [historyItems]);

  const filteredSuggestions = useMemo(() => {
    if (!itemName.trim()) {
      return smartSuggestions.slice(0, 10);
    }

    return smartSuggestions.filter((item) =>
      item.toLowerCase().includes(itemName.toLowerCase()),
    );
  }, [itemName, smartSuggestions]);

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

  const requestItem = async () => {
    if (!itemName.trim()) return;

    try {
      await addDoc(collection(db, "rooms", joinedRoom, "requests"), {
        itemName: itemName,
        requestedBy: savedUsername,
        status: "PENDING",
        createdAt: serverTimestamp(),
      });

      await sendRoleBasedNotification(
        "SENDER",
        "New Item Request",
        `${savedUsername} requested ${itemName}`,
      );

      setItemName("");
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
        quantity,
        unit: selectedUnit,
        status: "PENDING",
        addedBy: savedUsername,
        archived: false,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "rooms", joinedRoom, "history"), {
        name: finalItemName,
        createdAt: serverTimestamp(),
      });

      await sendRoleBasedNotification(
        "BUYER",
        "New Grocery Item",
        `${savedUsername} added ${finalItemName}`,
      );

      await addActivity(`${savedUsername} added ${finalItemName}`);

      setItemName("");
      setQuantity("");

      setSelectedUnit("pcs");
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

      await sendRoleBasedNotification(
        "SENDER",
        "Item Status Updated",
        `${savedUsername} marked item as ${status.replaceAll("_", " ")}`,
      );

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

      await sendRoleBasedNotification(
        "SENDER",
        "Alternative Suggested",
        `${savedUsername} suggested ${alternative}`,
      );

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

  const archiveItem = async (id: string) => {
    try {
      await updateDoc(doc(db, "rooms", joinedRoom, "items", id), {
        archived: true,
      });
      await addActivity(`${savedUsername} archived an item`);
    } catch (error) {
      console.log(error);
    }
  };
  const approveRequest = async (request: RequestItem) => {
    try {
      await addDoc(collection(db, "rooms", joinedRoom, "items"), {
        name: request.itemName,

        quantity: "",

        unit: "pcs",

        status: "PENDING",

        archived: false,

        addedBy: request.requestedBy,

        updatedBy: "",

        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "rooms", joinedRoom, "requests", request.id), {
        status: "ACCEPTED",
      });

      await addActivity(`${savedUsername} approved ${request.itemName}`);

      await sendRoleBasedNotification(
        "BUYER",
        "Request Accepted",
        `${request.itemName} was approved`,
      );
    } catch (error) {
      console.log(error);
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "rooms", joinedRoom, "requests", id), {
        status: "REJECTED",
      });

      await sendRoleBasedNotification(
        "BUYER",
        "Request Rejected",
        "Your item request was rejected",
      );
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

            <View className="mt-6">
              <View className="flex-row">
                <TextInput
                  placeholder="Add grocery item..."
                  value={itemName}
                  onChangeText={setItemName}
                  className="flex-1 rounded-l-2xl bg-white px-4 py-4 text-base"
                />

                <TouchableOpacity
                  onPress={() => {
                    if (role === "BUYER") {
                      requestItem();
                    } else {
                      addItem();
                    }
                  }}
                  className="items-center justify-center rounded-r-2xl bg-black px-6"
                >
                  <Text className="font-semibold text-white">
                    {role === "BUYER" ? "Request" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>

              {itemName.trim() && filteredSuggestions.length > 0 ? (
                <View className="mt-2 rounded-2xl bg-white p-2">
                  {filteredSuggestions.slice(0, 5).map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      onPress={() => setItemName(suggestion)}
                      className="rounded-xl px-4 py-3"
                    >
                      <Text className="text-black">{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TextInput
                placeholder="Qty"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                className="w-24 rounded-2xl bg-white px-4 py-4"
              />

              <FlatList
                horizontal
                data={units}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedUnit(item)}
                    className={`mr-3 rounded-2xl px-5 py-4 ${
                      selectedUnit === item ? "bg-black" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        selectedUnit === item ? "text-white" : "text-black"
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {role === "SENDER" &&
            requests.filter((r) => r.status === "PENDING").length > 0 ? (
              <View className="mt-6">
                <Text className="text-lg font-semibold text-black">
                  Pending Requests
                </Text>

                {requests
                  .filter((r) => r.status === "PENDING")
                  .map((request) => (
                    <View
                      key={request.id}
                      className="mt-4 rounded-3xl bg-white p-5"
                    >
                      <Text className="text-lg font-semibold text-black">
                        {request.itemName}
                      </Text>

                      <Text className="mt-1 text-gray-500">
                        Requested by {request.requestedBy}
                      </Text>

                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity
                          onPress={() => approveRequest(request)}
                          className="flex-1 rounded-2xl bg-green-500 py-4"
                        >
                          <Text className="text-center font-semibold text-white">
                            Accept
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => rejectRequest(request.id)}
                          className="flex-1 rounded-2xl bg-red-500 py-4"
                        >
                          <Text className="text-center font-semibold text-white">
                            Reject
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            ) : null}
            {role === "SENDER" ? (
              <>
                <Text className="mt-6 text-lg font-semibold text-black">
                  Smart Frequently Ordered
                </Text>

                <SuggestionsList
                  suggestions={filteredSuggestions}
                  onSelect={(value) => addItem(value)}
                />
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <MaterialIcons name="shopping-cart" size={70} color="#d1d5db" />

            <Text className="mt-5 text-2xl font-bold text-gray-400">
              No Matching Items
            </Text>

            <Text className="mt-2 text-center text-gray-400">
              Try changing search or filter settings.
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
            onArchive={() => archiveItem(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}
