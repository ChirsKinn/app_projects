import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getListingById,
  getProductById,
  money,
} from "../../services/productService";
import { Listing, Product } from "../../types";
import { colors, ui } from "../../theme";
import { priceCheckedLabel, stockLabel } from "../../services/importedPrices";

export default function ProductDetails() {
  const params = useLocalSearchParams<{ id: string; listingId: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const listingId = Array.isArray(params.listingId)
    ? params.listingId[0]
    : params.listingId;
  return (
    <DetailsContent key={`${id}:${listingId}`} id={id} listingId={listingId} />
  );
}

function DetailsContent({ id, listingId }: { id: string; listingId: string }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<{ product: Product; listing: Listing }>();
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getProductById(id), getListingById(listingId)])
      .then(([product, listing]) => {
        if (active && product && listing?.productId === product.id)
          setData({ product, listing });
      })
      .catch(() => {
        if (active) setError("Could not load this listing.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, listingId]);
  if (loading)
    return (
      <ActivityIndicator
        accessibilityLabel="Loading product"
        style={{ flex: 1 }}
        color={colors.green}
      />
    );
  if (!data)
    return (
      <View style={{ padding: 24, gap: 16 }}>
        <Text style={ui.title}>Listing not found</Text>
        <Text style={ui.body}>
          {error ||
            "This demo listing does not exist. Head back to find another good deal."}
        </Text>
        <Pressable
          accessibilityRole="button"
          style={ui.button}
          onPress={() => router.replace("/")}
        >
          <Text style={ui.buttonText}>Explore products</Text>
        </Pressable>
      </View>
    );
  const { product, listing } = data;
  const openStore = async () => {
    setOpening(true);
    setError("");
    try {
      await WebBrowser.openBrowserAsync(listing.website);
    } catch {
      setError("The website could not open. Please try again.");
    } finally {
      setOpening(false);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 22,
        paddingBottom: insets.bottom + 28,
        gap: 20,
      }}
    >
      <View
        style={{
          backgroundColor: colors.mint,
          borderRadius: 30,
          padding: 30,
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={ui.eyebrow}>{product.category.toUpperCase()}</Text>
        <Text style={{ fontSize: 76 }}>{product.emoji}</Text>
        <Text style={{ color: colors.green, fontWeight: "600" }}>
          {product.size}
        </Text>
      </View>
      <View>
        <Text style={[ui.title, { fontSize: 30, marginBottom: 10 }]}>
          {product.name}
        </Text>
        <Text style={ui.body}>{product.description}</Text>
      </View>
      <View style={[ui.card, { gap: 14 }]}>
        <Text style={ui.eyebrow}>YOUR LOCAL FIND</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text style={[ui.title, { flex: 1 }]}>{listing.storeName}</Text>
          <Text style={[ui.title, { fontSize: 34 }]}>
            {money(listing.price)}
          </Text>
        </View>
        <Text
          style={{
            color: listing.inStock ? colors.green : "#996737",
            fontWeight: "700",
          }}
        >
          {stockLabel(listing)}
        </Text>
        <Text style={ui.body}>{priceCheckedLabel(listing)}</Text>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: colors.border,
            paddingTop: 14,
            gap: 6,
          }}
        >
          <Text style={ui.eyebrow}>STORE ADDRESS</Text>
          <Text style={ui.body}>{listing.address}</Text>
        </View>
      </View>
      <Text style={ui.body}>
        {listing.priceSource === "online"
          ? "This is a real store location. The price was imported from the retailer’s product page, but has not been verified for this branch. Online prices and availability can change or depend on the website’s selected location. The button opens the source product page."
          : "This is a real store location with a demo price and demo availability for the college prototype. The button opens the retailer’s homepage."}
      </Text>
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={{ color: "#A23E30" }}>
          {error}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: opening }}
        disabled={opening}
        onPress={openStore}
        style={[ui.button, opening && { opacity: 0.6 }]}
      >
        <Text style={ui.buttonText}>
          {opening
            ? "Opening website…"
            : `Visit ${listing.storeName} website  ↗`}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
        style={{ padding: 12, alignItems: "center" }}
      >
        <Text style={{ color: colors.green, fontWeight: "700" }}>
          Keep exploring
        </Text>
      </Pressable>
    </ScrollView>
  );
}
