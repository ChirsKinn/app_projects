import { StyleSheet } from "react-native";
export const colors = {
  ink: "#173D35",
  muted: "#687D75",
  green: "#216B50",
  mint: "#EAF3DA",
  paper: "#FFFFFF",
  background: "#F6F8F3",
  border: "#DFE7DF",
};
export const ui = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#173D35",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: "800",
  },
  button: {
    backgroundColor: colors.green,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    minHeight: 48,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
