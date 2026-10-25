import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "./contexts";
import { Ionicons } from "@expo/vector-icons";

export function ThemeToggle() {
  const { colors, isDark, toggle } = useTheme();
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Changes the appearance of the app."
      onPress={toggle}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        alignSelf: "flex-end",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.input,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons
        name={isDark ? "sunny-outline" : "moon-outline"}
        size={20}
        color={colors.text}
      />
    </Pressable>
  );
}
export function Label({
  children,
  muted = false,
  size = 15,
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: muted ? colors.muted : colors.text,
        fontSize: size,
        lineHeight: size * 1.5,
      }}
    >
      {children}
    </Text>
  );
}
export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          padding: 22,
          gap: 18,
          paddingBottom: 50,
          width: "100%",
          maxWidth: 780,
          alignSelf: "center",
        }}
      >
        <View>
          <Label muted size={11}>
            ViralIQ / Research studio
          </Label>
          <Text
            accessibilityRole="header"
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: colors.text,
              marginTop: 8,
            }}
          >
            {title}
          </Text>
          <Label muted>{subtitle}</Label>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Card({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 20,
        padding: 18,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: secondary ? colors.input : colors.blue,
        borderWidth: 1,
        borderColor: secondary ? colors.line : colors.blue,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          color: secondary ? colors.text : "#fff",
          fontWeight: "700",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Input({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.input,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 12,
          padding: 14,
          minHeight: multiline ? 116 : 50,
          textAlignVertical: "top",
          fontSize: 16,
        }}
      />
    </View>
  );
}
export function Selector<T extends string | number>({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 9 }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {values.map((v) => (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: v === value }}
            accessibilityLabel={`${label}: ${v}`}
            onPress={() => onChange(v)}
            style={{
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 13,
              borderRadius: 11,
              borderWidth: 1,
              borderColor: v === value ? colors.blue : colors.line,
              backgroundColor: v === value ? colors.blue : colors.input,
            }}
          >
            <Text
              style={{
                color: v === value ? "white" : colors.muted,
                fontWeight: "600",
              }}
            >
              {v}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={{ flexGrow: 1, minWidth: "40%" }}>
      <Card>
        <Label muted size={12}>
          {label}
        </Label>
        <Label size={27}>{value}</Label>
      </Card>
    </View>
  );
}
export function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <Label size={21}>Your next idea starts here.</Label>
      <Label muted>{text}</Label>
    </Card>
  );
}
export function LoadingState({ text = "Loading…" }: { text?: string }) {
  return (
    <Card>
      <ActivityIndicator />
      <Label muted>{text}</Label>
    </Card>
  );
}
export function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Card>
        <Label size={18}>{title}</Label>
        <Label>{message}</Label>
      </Card>
    </View>
  );
}
export function Bars({ items }: { items: [string, number][] }) {
  const { colors } = useTheme();
  const max = Math.max(1, ...items.map((x) => x[1]));
  return (
    <View style={{ gap: 10 }}>
      {items.map(([name, n]) => (
        <View key={name}>
          <Label muted size={12}>
            {name} · {n}
          </Label>
          <View
            style={{
              height: 6,
              backgroundColor: colors.line,
              borderRadius: 5,
              marginTop: 5,
            }}
          >
            <View
              style={{
                height: 6,
                width: `${(n / max) * 100}%`,
                backgroundColor: colors.blue,
                borderRadius: 5,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
export const row = { flexDirection: "row", flexWrap: "wrap", gap: 12 } as const;
export const number = (v: number | undefined) =>
  v === undefined
    ? "Unavailable"
    : v.toLocaleString(undefined, { maximumFractionDigits: 1 });
export function age(date: string) {
  const n = Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 60000));
  return n < 60
    ? `${n} min ago`
    : n < 1440
      ? `${Math.floor(n / 60)} hours ago`
      : `${Math.floor(n / 1440)} days ago`;
}
