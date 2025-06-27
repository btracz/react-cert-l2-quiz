import type { RootState } from "../index";

// Categories Selectors
export const selectCategories = (state: RootState) =>
  state.categories.categories;
export const selectIsCategoriesLoading = (state: RootState) =>
  state.categories.isCategoriesLoading;
export const selectCategoriesError = (state: RootState) =>
  state.categories.categoriesError;
