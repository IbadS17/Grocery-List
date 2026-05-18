import AsyncStorage from "@react-native-async-storage/async-storage";

const ROLE_KEY = "user_role";

export const saveRole = async (role: string) => {
  try {
    await AsyncStorage.setItem(ROLE_KEY, role);
  } catch (error) {
    console.log(error);
  }
};

export const getRole = async () => {
  try {
    return await AsyncStorage.getItem(ROLE_KEY);
  } catch (error) {
    console.log(error);
  }
};
