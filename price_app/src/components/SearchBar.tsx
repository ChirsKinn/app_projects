import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus: () => void;
  onClear: () => void;
};
export function SearchBar({
  value,
  onChange,
  onSubmit,
  onFocus,
  onClear,
}: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        accessibilityLabel="Search products"
        placeholder="What’s on your shopping list?"
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {!!value && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={onClear}
          hitSlop={8}
          style={styles.clear}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  icon: { fontSize: 32, color: colors.green, marginRight: 10 },
  input: { flex: 1, height: 56, fontSize: 15, color: colors.ink },
  clear: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { fontSize: 26, color: colors.muted },
});
