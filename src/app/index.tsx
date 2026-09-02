import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";

const questionBank = [
  {
    question: "Canberra is the capital of Australia.",
    answer: true,
  },
  {
    question: "The Pacific Ocean is smaller than the Atlantic Ocean.",
    answer: false,
  },
  {
    question: "Mount Everest is the tallest mountain above sea level.",
    answer: true,
  },
  {
    question: "Brazil is located in Europe.",
    answer: false,
  },
  {
    question: "The Nile River is in Africa.",
    answer: true,
  },
];

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const question = questionBank[currentQuestion];

  useEffect(() => {
    ScreenOrientation.unlockAsync();
  }, []);

  const nextQuestion = () => {
    setCurrentQuestion(
      (currentQuestion + 1) % questionBank.length
    );
  };

  const previousQuestion = () => {
    setCurrentQuestion(
      (currentQuestion - 1 + questionBank.length) %
        questionBank.length
    );
  };

  const checkAnswer = (selectedAnswer: boolean) => {
    if (selectedAnswer === question.answer) {
      Alert.alert("Correct!", "Nice job!", [
        {
          text: "Continue",
          onPress: nextQuestion,
        },
      ]);
    } else {
      Alert.alert("Incorrect", "Try again!");
    }
  };

  const openCheatScreen = () => {
    router.push({
      pathname: "/cheat",
      params: {
        answer: question.answer.toString(),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        isLandscape && styles.landscapeContainer,
      ]}
    >
      <Text style={styles.question}>
        {question.question}
      </Text>

      <View
        style={[
          styles.answerRow,
          isLandscape && styles.landscapeRow,
        ]}
      >
        <Pressable
          style={styles.button}
          onPress={() => checkAnswer(true)}
        >
          <Text style={styles.buttonText}>
            TRUE
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => checkAnswer(false)}
        >
          <Text style={styles.buttonText}>
            FALSE
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.navigationRow,
          isLandscape && styles.landscapeRow,
        ]}
      >
        <Pressable
          style={styles.navButton}
          onPress={previousQuestion}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="white"
          />

          <Text style={styles.buttonText}>
            PREV
          </Text>
        </Pressable>

        <Pressable
          style={styles.navButton}
          onPress={nextQuestion}
        >
          <Text style={styles.buttonText}>
            NEXT
          </Text>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="white"
          />
        </Pressable>
      </View>

      <Pressable onPress={openCheatScreen}>
        <Text style={styles.cheatText}>
          CHEAT
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
    justifyContent: "center",
    padding: 24,
  },

  landscapeContainer: {
    paddingHorizontal: 120,
  },

  question: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 40,
  },

  answerRow: {
    flexDirection: "row",
    gap: 80,
    marginBottom: 45,
  },

  navigationRow: {
    flexDirection: "row",
    gap: 70,
    marginBottom: 40,
  },

  landscapeRow: {
    width: "65%",
    justifyContent: "space-between",
  },

  button: {
    backgroundColor: "#6C5CE7",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 6,
  },

  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C5CE7",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  cheatText: {
    color: "#6C5CE7",
    fontSize: 24,
  },
});