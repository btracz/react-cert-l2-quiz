import { createSlice } from "@reduxjs/toolkit";
import type { QuizCategory } from "../../shared/types/QuizCategory";
import { fetchCategories } from "../thunks/categoriesThunks";

export interface CategoriesState {
  // Categories
  categories: QuizCategory[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  isCategoriesLoading: false,
  categoriesError: null,
};

const categoriesSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories thunk
      .addCase(fetchCategories.pending, (state) => {
        state.isCategoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.categoriesError = action.payload as string;
      });
  },
});

export default categoriesSlice.reducer;
