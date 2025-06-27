import { createAsyncThunk } from "@reduxjs/toolkit";
import type { QuizCategoryAPIResponse } from "../../shared/types/QuizCategory";

export const fetchCategories = createAsyncThunk(
  "quiz/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuizCategoryAPIResponse = await response.json();
      return data.trivia_categories;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  }
);
