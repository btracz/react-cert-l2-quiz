import type { QuizQuestion as QuizQuestionType } from "../../../shared/types/Quiz";
import { QuizAnswer } from "../QuizAnswer/QuizAnswer";
import classes from "./QuizQuestion.module.scss";

export interface QuizQuestionProps {
  quizQuestion: QuizQuestionType;
  givenAnswer?: string;
  selectQuestionAnswer?: (questionId: string, answer: string) => void;
  shouldShowCorrect?: boolean;
}

export const QuizQuestion = ({
  quizQuestion,
  givenAnswer,
  selectQuestionAnswer,
  shouldShowCorrect = false,
}: QuizQuestionProps) => {
  return (
    <div key={quizQuestion.id} className={classes.question}>
      <b>{quizQuestion.question}</b>
      <div>
        {quizQuestion.shuffledAnswers.map((answer) => (
          <button
            className={classes.answerButton}
            key={answer}
            onClick={() => selectQuestionAnswer?.(quizQuestion.id, answer)}
            disabled={shouldShowCorrect}
          >
            <QuizAnswer
              key={answer}
              value={answer}
              isSelected={givenAnswer === answer}
              isCorrect={quizQuestion.correctAnswer === answer}
              shouldShowCorrect={
                shouldShowCorrect &&
                (givenAnswer === answer ||
                  quizQuestion.correctAnswer === answer)
              }
              isDisabled={shouldShowCorrect}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
