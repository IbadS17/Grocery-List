import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";

import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import { getUsername } from "../lib/user";

import { getRoom } from "../lib/room";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  const [hasSetup, setHasSetup] = useState(false);

  const segments = useSegments() as string[];

  useEffect(() => {
    const checkSetup = async () => {
      const username = await getUsername();

      const room = await getRoom();

      if (username && room) {
        setHasSetup(true);
      }

      setLoading(false);
    };

    checkSetup();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!hasSetup && !segments.includes("onboarding")) {
    return <Redirect href="/onboarding" />;
  }

  if (hasSetup && segments.includes("onboarding")) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
