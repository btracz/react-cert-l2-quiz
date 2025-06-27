import cn from "classnames";
import classes from "./QuizAnswer.module.scss";

export const QuizAnswer = ({
  value,
  isCorrect,
  isSelected,
  shouldShowCorrect = false,
  isDisabled = false,
}: {
  value: string;
  isCorrect?: boolean;
  isSelected?: boolean;
  shouldShowCorrect?: boolean;
  isDisabled?: boolean;
}) => (
  <div
    className={cn(
      classes.answer,
      !shouldShowCorrect && !isDisabled && classes.hoverable,
      !shouldShowCorrect && isSelected ? classes.selected : "",
      shouldShowCorrect && isCorrect ? classes.correct : "",
      shouldShowCorrect && !isCorrect ? classes.incorrect : ""
    )}
  >
    <span className="answer-text">{value}</span>
  </div>
);
