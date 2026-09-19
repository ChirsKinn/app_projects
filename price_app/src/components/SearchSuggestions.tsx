import { Pressable, ScrollView, Text, View } from "react-native";
import { Product } from "../types";
import { colors, ui } from "../theme";
export function SearchSuggestions({
  products,
  loading,
  onSelect,
}: {
  products: Product[];
  loading: boolean;
  onSelect: (product: Product) => void;
}) {
  return (
    <View style={[ui.card, { padding: 8, marginTop: 8 }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ maxHeight: 230 }}
      >
        {loading ? (
          <Text style={[ui.body, { padding: 14 }]}>Finding products…</Text>
        ) : products.length ? (
          products.map((product) => (
            <Pressable
              key={product.id}
              accessibilityRole="button"
              onPress={() => onSelect(product)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 13,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 23 }}>{product.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: colors.ink, fontWeight: "600", fontSize: 15 }}
                >
                  {product.name}
                </Text>
                <Text style={ui.body}>{product.size}</Text>
              </View>
              <Text style={ui.body}>↗</Text>
            </Pressable>
          ))
        ) : (
          <View accessibilityLiveRegion="polite" style={{ padding: 14 }}>
            <Text style={{ color: colors.ink, fontWeight: "700" }}>
              No products found
            </Text>
            <Text style={ui.body}>Try “Monster”, “milk”, or “eggs”.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
