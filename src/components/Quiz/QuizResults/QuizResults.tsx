import cn from "classnames";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCurrentQuiz,
  selectCurrentResults,
} from "../../../store/selectors/quizSelectors";
import { QuizQuestion } from "../QuizQuestion/QuizQuestion";
import classes from "./QuizResults.module.scss";
import { resetQuiz } from "../../../store/slices/quizSlice";
import { useNavigate } from "react-router-dom";

export const QuizResults = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentQuiz = useAppSelector(selectCurrentQuiz);
  const currentResults = useAppSelector(selectCurrentResults);

  const isQuizCompleted = !!currentQuiz || currentResults?.score !== undefined;

  const resultClassName = useMemo(() => {
    if (!isQuizCompleted) {
      return "";
    }

    if (currentResults!.score <= 1) {
      return classes.fail;
    }

    if (currentResults!.score >= 4) {
      return classes.pass;
    }

    return classes.intermediate;
  }, [isQuizCompleted, currentResults]);

  const handleNewQuiz = () => {
    dispatch(resetQuiz());
    navigate("/");
  };

  return (
    <div id="results" data-testid="results">
      {isQuizCompleted && (
        <>
          {currentQuiz?.questions.map((quizQuestion) => (
            <QuizQuestion
              key={quizQuestion.id}
              quizQuestion={quizQuestion}
              givenAnswer={currentResults?.answers[quizQuestion.id]}
              shouldShowCorrect
            />
          ))}
          <div id="score" className={cn(classes.score, resultClassName)}>
            You scored {currentResults?.score} out of{" "}
            {currentQuiz?.questions.length}
          </div>
        </>
      )}
      <button className={classes.restart} onClick={handleNewQuiz}>
        Create a new quiz
      </button>
    </div>
  );
};
