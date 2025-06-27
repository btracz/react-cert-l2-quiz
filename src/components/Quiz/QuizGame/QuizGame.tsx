import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { QuizDifficultyLevel } from "../../../shared/enum";
import type { QuizCategory } from "../../../shared/types/QuizCategory";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { submitQuiz } from "../../../store/slices/quizSlice";
import {
  selectCurrentQuiz,
  selectIsLoading,
} from "../../../store/selectors/quizSelectors";
import { QuizQuestion } from "../QuizQuestion/QuizQuestion";
import { Loader } from "../../../design-system/Loader/Loader";
import classes from "./QuizGame.module.scss";
import { map } from "lodash";

export interface QuizGameProps {
  category?: QuizCategory;
  difficulty?: QuizDifficultyLevel;
}

export const QuizGame = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentQuiz = useAppSelector(selectCurrentQuiz);
  const isLoading = useAppSelector(selectIsLoading);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const isFullyAnswered =
    Object.keys(selectedAnswers).length === currentQuiz?.questions.length;

  // Reset selected answers when the current quiz changes
  useEffect(() => {
    const questionIds = map(currentQuiz?.questions, "id");
    const firstSelectedQuestionId = Object.keys(selectedAnswers)?.[0];
    // Remove selected answers on current quiz change
    if (
      currentQuiz &&
      firstSelectedQuestionId &&
      !questionIds.includes(firstSelectedQuestionId)
    ) {
      setSelectedAnswers({});
    }
  }, [currentQuiz, selectedAnswers]);

  const selectQuestionAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleQuizSubmit = () => {
    dispatch(submitQuiz(selectedAnswers));
    navigate("/results");
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div id="quiz" data-testid="quiz-game">
      {currentQuiz?.questions.map((quizQuestion) => (
        <QuizQuestion
          key={quizQuestion.id}
          quizQuestion={quizQuestion}
          selectQuestionAnswer={selectQuestionAnswer}
          givenAnswer={selectedAnswers[quizQuestion.id]}
        />
      ))}
      {isFullyAnswered && (
        <button className={classes.submit} onClick={handleQuizSubmit}>
          Submit
        </button>
      )}
    </div>
  );
};
