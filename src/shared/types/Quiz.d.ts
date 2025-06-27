export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  shuffledAnswers: string[];
}

export interface Quiz {
  type: string;
  category: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizAPIResponse {
  response_code: number;
  results: QuizAPIQuestion[];
}

export interface QuizAPIQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}
