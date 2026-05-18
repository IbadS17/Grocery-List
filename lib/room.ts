import AsyncStorage from "@react-native-async-storage/async-storage";

const ROOM_KEY = "joined_room";

export const saveRoom = async (room: string) => {
  try {
    await AsyncStorage.setItem(ROOM_KEY, room);
    return true;
  } catch (error) {
    console.error("saveRoom error", error);
    return false;
  }
};

export const getRoom = async () => {
  try {
    return await AsyncStorage.getItem(ROOM_KEY);
  } catch (error) {
    console.error("getRoom error", error);
    return null;
  }
};
