import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

export default function CheatScreen() {
  const { answer } = useLocalSearchParams();

  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.warning}>
        Are you sure you want to do this?
      </Text>

      {showAnswer && (
        <Text style={styles.answer}>
          Answer: {answer === "true" ? "TRUE" : "FALSE"}
        </Text>
      )}

      <Pressable
        style={styles.button}
        onPress={() => setShowAnswer(true)}
      >
        <Text style={styles.buttonText}>
          SHOW ANSWER
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 80,
  },

  warning: {
    fontSize: 22,
    marginBottom: 80,
  },

  answer: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#6C5CE7",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },
});