import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  roomId: string;

  setRoomId: (value: string) => void;

  joinedRoom: string;

  onJoin: () => void;
}

export default function RoomJoinCard({
  roomId,
  setRoomId,
  joinedRoom,
  onJoin,
}: Props) {
  return (
    <View className="mb-6 rounded-3xl bg-white p-5">
      <Text className="text-xl font-bold text-black">Join Family Room</Text>

      <TextInput
        placeholder="Enter room code..."
        value={roomId}
        onChangeText={setRoomId}
        className="mt-4 rounded-2xl bg-gray-100 px-4 py-4"
      />

      <TouchableOpacity
        onPress={onJoin}
        className="mt-4 rounded-2xl bg-black py-4"
      >
        <Text className="text-center font-semibold text-white">Join Room</Text>
      </TouchableOpacity>

      {joinedRoom ? (
        <Text className="mt-3 font-medium text-green-600">
          Joined Room: {joinedRoom}
        </Text>
      ) : null}
    </View>
  );
}
