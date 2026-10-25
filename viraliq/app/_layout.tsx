import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Providers, useTheme } from "../src/contexts";
function Navigation() {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.blue,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.line,
          },
        }}
      >
        {(
          [
            "index",
            "analyze",
            "results",
            "generate",
            "history",
            "compare",
          ] as const
        ).map((name, i) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: [
                "Home",
                "Analyze",
                "Results",
                "Generate",
                "History",
                "Compare",
              ][i],
              href: name === "compare" ? null : undefined,
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={
                    (
                      [
                        "grid-outline",
                        "search-outline",
                        "stats-chart-outline",
                        "sparkles-outline",
                        "time-outline",
                        "git-compare-outline",
                      ] as const
                    )[i]
                  }
                  color={typeof color === "string" ? color : colors.muted}
                  size={size}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}
export default function Layout() {
  return (
    <Providers>
      <Navigation />
    </Providers>
  );
}
