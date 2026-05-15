import "../global.css";

import { Stack } from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import { Redirect } from "expo-router";

import {
  getUsername,
} from "../lib/user";

import {
  getRoom,
} from "../lib/room";

export default function RootLayout() {
  const [loading, setLoading] =
    useState(true);

  const [hasSetup, setHasSetup] =
    useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      const username =
        await getUsername();

      const room = await getRoom();

      if (username && room) {
        setHasSetup(true);
      }

      setLoading(false);
    };

    checkSetup();
  }, []);

  if (loading) return null;

  if (!hasSetup) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}