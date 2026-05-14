import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { Item } from "../types/item";

interface Props {
  item: Item;

  alternativeValue: string;

  onAlternativeChange: (value: string) => void;

  onBought: () => void;

  onOutOfStock: () => void;

  onAddAlternative: () => void;

  getStatusColor: (status: Item["status"]) => string;

  onArchive: () => void;
}

export default function ItemCard({
  item,
  alternativeValue,
  onAlternativeChange,
  onBought,
  onOutOfStock,
  onAddAlternative,
  getStatusColor,
  onArchive,
}: Props) {
  return (
    <View className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-xl font-semibold text-black">{item.name}</Text>
          {item.quantity ? (
            <Text className="mt-1 text-gray-500">
              {item.quantity} {item.unit}
            </Text>
          ) : null}

          <Text className={`mt-2 font-medium ${getStatusColor(item.status)}`}>
            {item.status.replaceAll("_", " ")}
          </Text>

          {item.addedBy ? (
            <Text className="mt-1 text-sm text-gray-400">
              Added by {item.addedBy}
            </Text>
          ) : null}

          {item.updatedBy ? (
            <Text className="mt-1 text-sm text-gray-400">
              Updated by {item.updatedBy}
            </Text>
          ) : null}
        </View>

        <MaterialIcons
          name={
            item.status === "BOUGHT"
              ? "check-circle"
              : item.status === "OUT_OF_STOCK"
                ? "cancel"
                : "access-time"
          }
          size={28}
          color={
            item.status === "BOUGHT"
              ? "green"
              : item.status === "OUT_OF_STOCK"
                ? "red"
                : "#ca8a04"
          }
        />
      </View>

      {item.alternative && (
        <View className="mt-4 rounded-2xl bg-blue-50 p-4">
          <Text className="font-semibold text-blue-700">
            Suggested Alternative
          </Text>

          <Text className="mt-1 text-blue-600">{item.alternative}</Text>
        </View>
      )}

      <View className="mt-5 flex-row gap-3">
        <TouchableOpacity
          onPress={onBought}
          className="flex-1 rounded-2xl bg-green-500 py-4"
        >
          <Text className="text-center font-semibold text-white">Bought</Text>
        </TouchableOpacity>

        {item.status === "BOUGHT" ? (
          <TouchableOpacity
            onPress={onArchive}
            className="flex-1 rounded-2xl bg-gray-200 py-4"
          >
            <Text className="text-center font-semibold text-gray-700">
              Delete
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={onOutOfStock}
          className="flex-1 rounded-2xl bg-red-500 py-4"
        >
          <Text className="text-center font-semibold text-white">
            Out Of Stock
          </Text>
        </TouchableOpacity>
      </View>

      {item.status === "OUT_OF_STOCK" && (
        <View className="mt-4">
          <TextInput
            placeholder="Suggest alternative..."
            value={alternativeValue}
            onChangeText={onAlternativeChange}
            className="rounded-2xl bg-gray-100 px-4 py-4"
          />

          <TouchableOpacity
            onPress={onAddAlternative}
            className="mt-3 rounded-2xl bg-blue-500 py-4"
          >
            <Text className="text-center font-semibold text-white">
              Add Alternative
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
