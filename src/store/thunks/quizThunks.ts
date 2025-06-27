import { createAsyncThunk } from "@reduxjs/toolkit";
import type { QuizCategory } from "../../shared/types/QuizCategory";
import type { QuizDifficultyLevel } from "../../shared/enum";
import type { QuizAPIResponse } from "../../shared/types/Quiz";
import { mapAPIQuizDataToQuiz } from "../../domain/mappers/quiz.mapper";

export const fetchQuizData = createAsyncThunk(
  "quiz/fetchQuizData",
  async (
    {
      category,
      difficulty,
      amount = 5,
    }: {
      category: QuizCategory;
      difficulty: QuizDifficultyLevel;
      amount?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${category.id}&difficulty=${difficulty}&type=multiple`
      );

      if (!response.ok) {
        throw new Error(response?.status?.toString());
      }

      const data: QuizAPIResponse = await response.json();

      if (data.response_code !== 0) {
        throw new Error("No questions available for the selected criteria");
      }

      return mapAPIQuizDataToQuiz(data);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      if ((error as Error).message === "429") {
        alert(
          `Please wait a moment before trying again. You have made too many requests.`
        );
      }
      return rejectWithValue(message);
    }
  }
);
