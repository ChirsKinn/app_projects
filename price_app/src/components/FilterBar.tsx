import { Pressable, ScrollView, Text } from "react-native";
import { SortOrder } from "../types";
import { colors } from "../theme";
export function FilterBar({
  sort,
  inStock,
  onSort,
  onStock,
}: {
  sort: SortOrder;
  inStock: boolean;
  onSort: (sort: SortOrder) => void;
  onStock: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
    >
      {[
        {
          label: "↓ Cheapest",
          active: sort === "cheapest",
          action: () => onSort("cheapest"),
        },
        {
          label: "◎ Closest",
          active: sort === "closest",
          action: () => onSort("closest"),
        },
        { label: "✓ In stock", active: inStock, action: onStock },
      ].map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: item.active }}
          onPress={item.action}
          style={{
            borderRadius: 24,
            paddingHorizontal: 17,
            paddingVertical: 12,
            backgroundColor: item.active ? colors.ink : "white",
            borderWidth: 1,
            borderColor: item.active ? colors.ink : colors.border,
          }}
        >
          <Text
            style={{
              color: item.active ? "white" : colors.ink,
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
