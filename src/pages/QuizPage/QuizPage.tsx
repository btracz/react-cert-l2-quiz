import { QuizGame } from "../../components/Quiz/QuizGame/QuizGame";
import { QuizParameters } from "../../components/Quiz/QuizParameters/QuizParameters";
import { Header } from "../../design-system/Header/Header";

/**
 * QuizPage component that renders the quiz parameters and game as configured.
 */
export const QuizPage = () => {
  return (
    <>
      <Header text="Quiz Maker" />
      <QuizParameters />
      <QuizGame />
    </>
  );
};
