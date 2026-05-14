import { ScrollView, Text, TouchableOpacity } from "react-native";

interface Props {
  suggestions: string[];

  onSelect: (value: string) => void;
}

export default function SuggestionsList({ suggestions, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
    >
      {suggestions.map((suggestion) => (
        <TouchableOpacity
          key={suggestion}
          onPress={() => onSelect(suggestion)}
          className="mr-3 rounded-2xl bg-white px-5 py-3"
        >
          <Text className="font-medium text-black">{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
