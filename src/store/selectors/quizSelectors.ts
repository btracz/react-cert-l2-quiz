import type { RootState } from "../index";

export const selectQuizParameters = (state: RootState) => ({
  category: state.quiz.selectedCategory,
  difficulty: state.quiz.selectedDifficulty,
});

export const selectCurrentQuiz = (state: RootState) => state.quiz.currentQuiz;

// Loading and Error Selectors
export const selectIsLoading = (state: RootState) => state.quiz.isLoading;
export const selectError = (state: RootState) => state.quiz.error;

// Results Selectors
export const selectCurrentResults = (state: RootState) => state.quiz.results;
