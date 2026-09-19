import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6C5CE7",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#FFFFFF",
        },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "GeoQuiz",
        }}
      />

      <Stack.Screen
        name="cheat"
        options={{
          title: "GeoQuiz",
        }}
      />
    </Stack>
  );
}