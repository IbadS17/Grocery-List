import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getRole } from "./role";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    alert("Must use physical device");
    return;
  }

  // Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#22c55e",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Notification permission not granted");
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync();

  console.log("Expo Push Token:", token.data);

  return token.data;
};

export const sendRoleBasedNotification = async (
  targetRole: "BUYER" | "SENDER",
  title: string,
  body: string,
) => {
  try {
    const currentRole = await getRole();

    if (currentRole !== targetRole) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },

      trigger: null,
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendLocalNotification = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },

      trigger: null,
    });
  } catch (error) {
    console.log(error);
  }
};
