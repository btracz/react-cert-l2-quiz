import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { QuizCategory } from "../../shared/types/QuizCategory";
import type { QuizDifficultyLevel } from "../../shared/enum";
import type { Quiz } from "../../shared/types/Quiz";
import { fetchQuizData } from "../thunks/quizThunks";

export interface QuizResults {
  score: number;
  answers: Record<string, string>;
}

export interface QuizState {
  // Quiz Parameters
  selectedCategory: QuizCategory | null;
  selectedDifficulty: QuizDifficultyLevel | null;

  // Quiz Game State
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;

  // Results
  results: QuizResults | null;
}

const initialState: QuizState = {
  selectedCategory: null,
  selectedDifficulty: null,
  currentQuiz: null,
  isLoading: false,
  error: null,
  results: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    // Quiz Parameters Actions
    setQuizParameters: (
      state,
      action: PayloadAction<{
        category: QuizCategory;
        difficulty: QuizDifficultyLevel;
      }>
    ) => {
      state.selectedCategory = action.payload.category;
      state.selectedDifficulty = action.payload.difficulty;
    },

    clearQuizParameters: (state) => {
      state.selectedCategory = null;
      state.selectedDifficulty = null;
    },

    // Quiz Loading Actions
    setQuizLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setQuizError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    submitQuiz: (state, action: PayloadAction<Record<string, string>>) => {
      const score = Object.entries(action.payload).reduce(
        (acc, [questionId, answer]) => {
          const question = state.currentQuiz?.questions.find(
            (q) => q.id === questionId
          );
          if (question && question.correctAnswer === answer) {
            return acc + 1;
          }
          return acc;
        },
        0
      );

      const results: QuizResults = {
        score,
        answers: { ...action.payload },
      };

      state.results = results;
    },

    // Reset Actions
    resetQuiz: (state) => {
      state.currentQuiz = null;
      state.results = null;
      state.error = null;
      state.isLoading = false;
    },

    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentQuiz = action.payload;
        state.error = null;
      })
      .addCase(fetchQuizData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setQuizParameters,
  clearQuizParameters,
  setQuizLoading,
  setQuizError,
  submitQuiz,
  resetQuiz,
  resetAll,
} = quizSlice.actions;

export default quizSlice.reducer;
