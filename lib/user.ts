import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "username";

export const saveUsername = async (username: string) => {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
    return true;
  } catch (error) {
    console.error("saveUsername error", error);
    return false;
  }
};

export const getUsername = async () => {
  try {
    return await AsyncStorage.getItem(USERNAME_KEY);
  } catch (error) {
    console.error("getUsername error", error);
    return null;
  }
};
