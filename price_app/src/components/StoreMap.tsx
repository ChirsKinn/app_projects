import { useEffect, useRef } from "react";
import MapView from "react-native-maps";
import { StyleSheet } from "react-native";
import { Coordinates, Listing } from "../types";
import { PriceMarker } from "./PriceMarker";
export type MapProps = {
  center: Coordinates;
  listings: Listing[];
  selectedId?: string;
  showUser: boolean;
  onSelect: (listing: Listing) => void;
  onMapPress: () => void;
};
export default function StoreMap({
  center,
  listings,
  selectedId,
  showUser,
  onSelect,
  onMapPress,
}: MapProps) {
  const map = useRef<MapView>(null);
  useEffect(() => {
    map.current?.animateToRegion(
      { ...center, latitudeDelta: 0.14, longitudeDelta: 0.14 },
      650,
    );
  }, [center]);
  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...center, latitudeDelta: 0.14, longitudeDelta: 0.14 }}
      showsUserLocation={showUser}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      onPress={(event) => {
        // Android can forward marker presses to the map as well.
        if (event.nativeEvent.action !== "marker-press") onMapPress();
      }}
    >
      {listings.map((listing) => (
        <PriceMarker
          key={listing.id}
          listing={listing}
          selected={listing.id === selectedId}
          onPress={() => onSelect(listing)}
        />
      ))}
    </MapView>
  );
}
