import { create } from "zustand";

interface RoomStore {
  joinedRoom: string;

  setJoinedRoom: (room: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  joinedRoom: "",

  setJoinedRoom: (room) =>
    set({
      joinedRoom: room,
    }),
}));
