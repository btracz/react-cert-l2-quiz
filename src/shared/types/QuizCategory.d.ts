export interface QuizCategoryAPIResponse {
  trivia_categories: QuizCategory[];
}

export interface QuizCategory {
  id: number;
  name: string;
}
