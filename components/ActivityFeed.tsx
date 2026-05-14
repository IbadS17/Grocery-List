import { Text, View } from "react-native";

import { Activity } from "../types/activity";

interface Props {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: Props) {
  return (
    <View className="mt-6">
      <Text className="text-lg font-semibold text-black">Live Activity</Text>

      <View className="mt-3 rounded-3xl bg-white p-4">
        {activities.length === 0 ? (
          <Text className="text-gray-400">No activity yet</Text>
        ) : (
          activities.slice(0, 5).map((activity) => (
            <View
              key={activity.id}
              className="mb-3 border-b border-gray-100 pb-3"
            >
              <Text className="text-gray-700">{activity.message}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
