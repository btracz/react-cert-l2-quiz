import { shuffle } from "lodash";
import type {
  Quiz,
  QuizAPIQuestion,
  QuizAPIResponse,
} from "../../shared/types/Quiz";

// Utility function to decode HTML entities
const decodeHTMLEntities = (text: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

export const mapAPIQuizDataToQuiz = (data: QuizAPIResponse): Quiz => {
  return {
    type: data.results?.[0]?.type,
    category: data.results?.[0]?.category,
    difficulty: data.results?.[0]?.difficulty,
    questions: data.results.map((question: QuizAPIQuestion) => ({
      id: crypto.randomUUID(), // Generate a unique ID for each question
      question: decodeHTMLEntities(question.question),
      correctAnswer: decodeHTMLEntities(question.correct_answer),
      incorrectAnswers: question.incorrect_answers.map(decodeHTMLEntities),
      shuffledAnswers: shuffle([
        decodeHTMLEntities(question.correct_answer),
        ...question.incorrect_answers.map(decodeHTMLEntities),
      ]),
    })),
  };
};
