import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Coordinates, Listing, Product } from "../types";
import { distanceMiles, money } from "../services/productService";
import { colors, ui } from "../theme";
import { priceCheckedLabel, stockLabel } from "../services/importedPrices";
export function ProductCard({
  product,
  listing,
  origin,
  isDemo,
}: {
  product: Product;
  listing: Listing;
  origin: Coordinates;
  isDemo: boolean;
}) {
  return (
    <View style={ui.card}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View
          style={{
            borderRadius: 16,
            backgroundColor: colors.mint,
            width: 54,
            height: 58,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28 }}>{product.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[ui.eyebrow, { marginBottom: 4 }]}>
            {listing.storeName.toUpperCase()}
          </Text>
          <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700" }}>
            {product.name}
          </Text>
          <Text style={ui.body}>{product.size}</Text>
        </View>
        <Text style={[ui.title, { fontSize: 25 }]}>{money(listing.price)}</Text>
      </View>
      <Text style={[ui.body, { marginTop: 12 }]}>{listing.address}</Text>
      <Text style={[ui.body, { marginTop: 3, marginBottom: 14 }]}>
        {stockLabel(listing)} · {distanceMiles(origin, listing).toFixed(1)} mi{" "}
        {isDemo ? "from St. George center" : "away"}
      </Text>
      <Text style={[ui.body, { marginBottom: 12 }]}>
        {priceCheckedLabel(listing)}
        {listing.priceSource === "online"
          ? " · Local store price may differ"
          : ""}
      </Text>
      <Pressable
        accessibilityRole="button"
        style={ui.button}
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: product.id, listingId: listing.id },
          })
        }
      >
        <Text style={ui.buttonText}>View details ↗</Text>
      </Pressable>
    </View>
  );
}
