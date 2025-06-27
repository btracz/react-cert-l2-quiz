import { useState } from "react";
import type { QuizCategory } from "../../../shared/types/QuizCategory";
import { QuizDifficultyLevel } from "../../../shared/enum";
import classes from "./QuizParameters.module.scss";
import { resetAll, setQuizParameters } from "../../../store/slices/quizSlice";
import { fetchQuizData } from "../../../store/thunks/quizThunks";
import { useAppDispatch } from "../../../store/hooks";
import { useCategories } from "../../../shared/hooks/useCategories.hook";

export const QuizParameters = () => {
  const dispatch = useAppDispatch();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const [quizCategory, setQuizCategory] = useState<QuizCategory>();
  const [difficultyLevel, setDifficultyLevel] = useState<QuizDifficultyLevel>(
    QuizDifficultyLevel.Easy
  );

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCategory = categories.find(
      (cat) => cat.id?.toString() === event.target.value
    );
    setQuizCategory(selectedCategory);
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDifficultyLevel(event.target.value as QuizDifficultyLevel);
  };

  const createQuiz = async () => {
    dispatch(resetAll());

    // Set the quiz parameters in the store
    dispatch(
      setQuizParameters({
        category: quizCategory!,
        difficulty: difficultyLevel,
      })
    );

    // Fetch quiz data
    await dispatch(
      fetchQuizData({ category: quizCategory!, difficulty: difficultyLevel })
    );
  };

  return (
    <>
      <select
        id="categorySelect"
        data-testid="categorySelect"
        value={quizCategory?.id ?? ""}
        className={classes.select}
        onChange={(e) => handleCategoryChange(e)}
      >
        {isCategoriesLoading ? (
          <option value="" disabled>
            Loading...
          </option>
        ) : (
          <option value="" disabled>
            Select a category
          </option>
        )}
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        id="difficultySelect"
        data-testid="difficultySelect"
        className={classes.select}
        value={difficultyLevel}
        onChange={handleDifficultyChange}
      >
        {Object.entries(QuizDifficultyLevel).map(([key, value]) => (
          <option key={key} value={value}>
            {key}
          </option>
        ))}
      </select>
      <button
        id="createBtn"
        disabled={!quizCategory || !difficultyLevel}
        onClick={createQuiz}
      >
        Create
      </button>
    </>
  );
};
