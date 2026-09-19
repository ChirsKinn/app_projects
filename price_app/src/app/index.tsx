import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StoreMap from "../components/StoreMap";
import { SearchBar } from "../components/SearchBar";
import { SearchSuggestions } from "../components/SearchSuggestions";
import { FilterBar } from "../components/FilterBar";
import { ProductCard } from "../components/ProductCard";
import {
  getListingsForProduct,
  getProductById,
  money,
  searchProducts,
  sortListings,
} from "../services/productService";
import {
  DEMO_LOCATION,
  loadLocation,
  LocationResult,
} from "../services/locationService";
import { Coordinates, Listing, Product, SortOrder } from "../types";
import { colors, ui } from "../theme";

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [product, setProduct] = useState<Product>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [sort, setSort] = useState<SortOrder>("cheapest");
  const [inStock, setInStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<LocationResult>({
    coordinates: DEMO_LOCATION,
    isDemo: true,
    message: "Finding your location…",
  });
  const [center, setCenter] = useState<Coordinates>(DEMO_LOCATION);
  const searchVersion = useRef(0);

  useEffect(() => {
    let active = true;
    loadLocation().then((result) => {
      if (active) {
        setLocation(result);
        setCenter(result.coordinates);
      }
    });
    getProductById("monster-12")
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch(() => {
        if (active) {
          setError("Could not load products. Please search again.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const version = ++searchVersion.current;
    let active = true;
    if (!query.trim() || !searchOpen) return;
    const timer = setTimeout(() => {
      searchProducts(query)
        .then((results) => {
          if (active && version === searchVersion.current) {
            setSuggestions(results);
            setSearching(false);
          }
        })
        .catch(() => {
          if (active && version === searchVersion.current) {
            setSearching(false);
            setError("Search unavailable. Please try again.");
          }
        });
    }, 120);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searchOpen]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    getListingsForProduct(product.id)
      .then((results) => {
        if (active) {
          setListings(results);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Could not load stores. Select a product to retry.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [product]);

  const visible = useMemo(
    () => sortListings(listings, sort, inStock, location.coordinates),
    [listings, sort, inStock, location.coordinates],
  );
  const selected = visible.find((listing) => listing.id === selectedId);
  const dismissSelection = () => {
    searchVersion.current++;
    setSelectedId(undefined);
    setSearchOpen(false);
    setSearching(false);
    Keyboard.dismiss();
  };
  const clearSearch = () => {
    dismissSelection();
    setQuery("");
    setSuggestions([]);
    setError("");
  };
  const choose = (next: Product) => {
    searchVersion.current++;
    setLoading(true);
    setListings([]);
    setProduct({ ...next });
    setQuery(next.name);
    setSearchOpen(false);
    setError("");
    setSelectedId(undefined);
    Keyboard.dismiss();
  };
  const submit = async () => {
    const version = ++searchVersion.current;
    if (!query.trim()) {
      setSearchOpen(false);
      Keyboard.dismiss();
      return;
    }
    try {
      const results = await searchProducts(query);
      if (version !== searchVersion.current) return;
      if (results[0]) choose(results[0]);
      else {
        setSuggestions([]);
        setSearching(false);
        setSearchOpen(true);
        Keyboard.dismiss();
      }
    } catch {
      setError("Search unavailable. Please try again.");
    }
  };
  const showSuggestions = searchOpen && !!query.trim();
  return (
    <View style={styles.screen}>
      <StoreMap
        center={center}
        listings={visible}
        selectedId={selected?.id}
        showUser={!location.isDemo}
        onMapPress={dismissSelection}
        onSelect={(listing) => {
          setSelectedId(listing.id);
          setSearchOpen(false);
          Keyboard.dismiss();
        }}
      />
      <KeyboardAvoidingView
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          pointerEvents="box-none"
          style={[styles.top, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>
              pricefinder<Text style={{ color: "#75A45B" }}>.</Text>
            </Text>
            <View style={styles.demo}>
              <Text style={ui.eyebrow}>DEMO</Text>
            </View>
          </View>
          <SearchBar
            value={query}
            onClear={clearSearch}
            onChange={(value) => {
              searchVersion.current++;
              setQuery(value);
              setSuggestions([]);
              setSearching(!!value.trim());
              setSearchOpen(true);
              setError("");
            }}
            onFocus={() => {
              if (!searchOpen) {
                setSearching(!!query.trim());
                setSearchOpen(true);
              }
            }}
            onSubmit={submit}
          />
          {showSuggestions ? (
            <SearchSuggestions
              products={suggestions}
              loading={searching}
              onSelect={choose}
            />
          ) : (
            <FilterBar
              sort={sort}
              inStock={inStock}
              onSort={(value) => {
                setSort(value);
                setSelectedId(undefined);
              }}
              onStock={() => {
                setInStock((value) => !value);
                setSelectedId(undefined);
              }}
            />
          )}
          <Text style={styles.location}>{location.message}</Text>
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={styles.location}>
              {error}
            </Text>
          )}
        </View>
        <View pointerEvents="box-none" style={{ flex: 1 }} />
        {!showSuggestions && (
          <View
            pointerEvents="box-none"
            style={[
              styles.bottom,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <View style={styles.controls}>
              <Pressable
                accessibilityRole="button"
                style={styles.control}
                onPress={() => setCenter({ ...DEMO_LOCATION })}
              >
                <Text style={styles.controlText}>⌖ St. George stores</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Recenter on your location"
                style={styles.control}
                onPress={() => setCenter({ ...location.coordinates })}
              >
                <Text style={styles.controlText}>
                  {location.isDemo ? "◎ City center" : "◎ My location"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.results}>
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: colors.ink, fontWeight: "700", flex: 1 }}
              >
                {loading
                  ? "Finding your next good deal…"
                  : `${visible.length} stores · ${sort === "cheapest" ? "lowest price first" : "nearest first"}`}
              </Text>
              <Text style={ui.eyebrow}>LOCAL FINDS</Text>
            </View>
            {visible.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingBottom: 8 }}
              >
                {visible.map((listing) => (
                  <Pressable
                    key={listing.id}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selected?.id === listing.id,
                    }}
                    onPress={() => {
                      setSelectedId(listing.id);
                      setCenter({
                        latitude: listing.latitude,
                        longitude: listing.longitude,
                      });
                    }}
                    style={[
                      styles.storeChip,
                      selected?.id === listing.id && {
                        backgroundColor: colors.mint,
                      },
                    ]}
                  >
                    <Text style={styles.controlText}>
                      {listing.storeName} · {money(listing.price)} ·{" "}
                      {listing.priceSource === "online" ? "Online" : "Demo"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {product && selected ? (
              <ProductCard
                product={product}
                listing={selected}
                origin={location.coordinates}
                isDemo={location.isDemo}
              />
            ) : (
              !loading &&
              visible.length === 0 && (
                <View style={ui.card}>
                  <Text style={ui.title}>No stores to show</Text>
                  <Text style={ui.body}>
                    Try another product or turn off the In stock filter.
                  </Text>
                </View>
              )
            )}
            <Text style={styles.footnote}>
              Real stores · prices labeled ONLINE or DEMO · not live inventory
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: 18 },
  bottom: { paddingHorizontal: 16 },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1.5,
    color: colors.ink,
  },
  demo: {
    backgroundColor: colors.mint,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  location: {
    color: colors.ink,
    backgroundColor: "#F6F8F3EE",
    borderRadius: 10,
    padding: 8,
    fontSize: 11,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  control: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 24,
    borderColor: colors.border,
    borderWidth: 1,
  },
  controlText: { color: colors.ink, fontSize: 12, fontWeight: "600" },
  results: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F6F8F3EF",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  storeChip: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
  },
  footnote: {
    textAlign: "center",
    color: colors.ink,
    backgroundColor: "#F6F8F3EE",
    borderRadius: 8,
    padding: 5,
    marginTop: 7,
    fontSize: 10,
  },
});
