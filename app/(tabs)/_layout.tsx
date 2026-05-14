import { Tabs } from "expo-router";

import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "black",

        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",

          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
