import { Pressable, Text } from "react-native";
import type { MapProps } from "./StoreMap";
import { colors, ui } from "../theme";
export default function StoreMap({ onMapPress }: MapProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Map background, dismiss store preview"
      onPress={onMapPress}
      style={{
        flex: 1,
        backgroundColor: "#E4ECDC",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <Text style={{ fontSize: 50, marginBottom: 12 }}>◎</Text>
      <Text style={ui.title}>Your next good find.</Text>
      <Text
        style={[
          ui.body,
          { textAlign: "center", marginTop: 8, color: colors.ink },
        ]}
      >
        Open in Expo Go for the interactive map.{"\n"}Search and browse demo
        store cards here.
      </Text>
    </Pressable>
  );
}
