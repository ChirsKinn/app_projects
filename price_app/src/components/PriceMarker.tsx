import { Text, View } from "react-native";
import { Marker } from "react-native-maps";
import { Listing } from "../types";
import { money } from "../services/productService";
import { colors } from "../theme";
import { stockLabel } from "../services/importedPrices";
export function PriceMarker({
  listing,
  selected,
  onPress,
}: {
  listing: Listing;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Marker
      coordinate={listing}
      stopPropagation
      onPress={onPress}
      zIndex={selected ? 10 : 1}
      accessibilityLabel={`${listing.storeName}, ${money(listing.price)}, ${stockLabel(listing)}, ${listing.priceSource} price`}
    >
      <View style={{ padding: 4 }}>
        <View
          style={{
            borderRadius: 20,
            backgroundColor: selected ? colors.ink : "white",
            borderWidth: 2,
            borderColor: selected
              ? colors.ink
              : listing.inStock
                ? colors.green
                : colors.muted,
            paddingVertical: 8,
            paddingHorizontal: 12,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: selected ? "white" : colors.ink,
              fontWeight: "800",
              fontSize: 15,
            }}
          >
            {money(listing.price)}
          </Text>
          {listing.inStock === false && (
            <Text
              style={{ fontSize: 9, color: selected ? "white" : colors.muted }}
            >
              OUT OF STOCK
            </Text>
          )}
          <Text
            style={{ fontSize: 9, color: selected ? "white" : colors.muted }}
          >
            {listing.priceSource === "online" ? "ONLINE" : "DEMO"}
          </Text>
        </View>
      </View>
    </Marker>
  );
}
