import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCategories } from "../../store/thunks/categoriesThunks";
import {
  selectCategories,
  selectIsCategoriesLoading,
  selectCategoriesError,
} from "../../store/selectors/categoriesSelector";

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectIsCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);

  useEffect(() => {
    // Only fetch categories if they haven't been loaded yet
    if (categories.length === 0 && !isLoading && !error) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, isLoading, error]);

  return {
    categories,
    isLoading,
    error,
    refetch: () => dispatch(fetchCategories()),
  };
};
