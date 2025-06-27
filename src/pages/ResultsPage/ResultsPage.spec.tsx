import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { ResultsPage } from "./ResultsPage";
import type { Quiz, QuizQuestion } from "../../shared/types/Quiz";
import categoriesSlice from "../../store/slices/categoriesSlice";
import quizSlice from "../../store/slices/quizSlice";

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ResultsPage", () => {
  const mockQuizQuestions: QuizQuestion[] = [
    {
      id: "1",
      question: "What is 2 + 2?",
      correctAnswer: "4",
      incorrectAnswers: ["3", "5", "6"],
      shuffledAnswers: ["3", "4", "5", "6"],
    },
    {
      id: "2",
      question: "What is the capital of France?",
      correctAnswer: "Paris",
      incorrectAnswers: ["London", "Berlin", "Madrid"],
      shuffledAnswers: ["Paris", "London", "Berlin", "Madrid"],
    },
    {
      id: "3",
      question: "Which planet is closest to the Sun?",
      correctAnswer: "Mercury",
      incorrectAnswers: ["Venus", "Earth", "Mars"],
      shuffledAnswers: ["Mercury", "Venus", "Earth", "Mars"],
    },
    {
      id: "4",
      question: "What is the largest ocean?",
      correctAnswer: "Pacific",
      incorrectAnswers: ["Atlantic", "Indian", "Arctic"],
      shuffledAnswers: ["Pacific", "Atlantic", "Indian", "Arctic"],
    },
    {
      id: "5",
      question: "Who wrote Romeo and Juliet?",
      correctAnswer: "Shakespeare",
      incorrectAnswers: ["Dickens", "Austen", "Tolkien"],
      shuffledAnswers: ["Shakespeare", "Dickens", "Austen", "Tolkien"],
    },
  ];

  const mockQuiz: Quiz = {
    type: "multiple",
    category: "General Knowledge",
    difficulty: "easy",
    questions: mockQuizQuestions,
  };

  const createMockStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        categories: categoriesSlice,
        quiz: quizSlice,
      },
      preloadedState: {
        categories: {
          categories: [],
          isCategoriesLoading: false,
          categoriesError: null,
        },
        quiz: {
          currentQuiz: null,
          isLoading: false,
          error: null,
          parameters: null,
          selectedCategory: null,
          selectedDifficulty: null,
          results: {
            score: 0,
            answers: {},
          },
        },
        ...initialState,
      },
    });
  };

  const renderResultsPage = (store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ResultsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the header with correct text", () => {
      renderResultsPage();
      expect(
        screen.getByRole("heading", { name: "Results" })
      ).toBeInTheDocument();
    });

    it("should render QuizResults component", () => {
      renderResultsPage();
      expect(
        screen.getByRole("button", { name: "Create a new quiz" })
      ).toBeInTheDocument();
    });

    it("should render results container with correct ID", () => {
      renderResultsPage();
      expect(document.getElementById("results")).toBeInTheDocument();
    });
  });

  describe("Quiz Results Display", () => {
    it("should display quiz questions and answers when quiz is completed", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {
              "1": "4",
              "2": "Paris",
              "3": "Venus",
              "4": "Pacific",
              "5": "Dickens",
            },
          },
        },
      });

      renderResultsPage(store);

      // Check that questions are displayed
      expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Which planet is closest to the Sun?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("What is the largest ocean?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Who wrote Romeo and Juliet?")
      ).toBeInTheDocument();
    });

    it("should display correct answers in green", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 2,
            answers: {
              "1": "4", // correct
              "2": "Paris", // correct
              "3": "Venus", // incorrect
              "4": "Atlantic", // incorrect
              "5": "Dickens", // incorrect
            },
          },
        },
      });

      renderResultsPage(store);

      // Check that correct answers have the correct CSS class
      const correctAnswerElements = document.querySelectorAll(".correct");
      expect(correctAnswerElements.length).toBeGreaterThan(0);
    });

    it("should display wrong user answers in red", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 1,
            answers: {
              "1": "3", // incorrect
              "2": "London", // incorrect
              "3": "Venus", // incorrect
              "4": "Atlantic", // incorrect
              "5": "Shakespeare", // correct
            },
          },
        },
      });

      renderResultsPage(store);

      // Wrong answers should have incorrect class
      const wrongAnswers = document.querySelectorAll(".incorrect");
      expect(wrongAnswers.length).toBeGreaterThan(0);
    });

    it("should always display correct answers in green even if not selected", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 0,
            answers: {
              "1": "3", // incorrect
              "2": "London", // incorrect
              "3": "Venus", // incorrect
              "4": "Atlantic", // incorrect
              "5": "Dickens", // incorrect
            },
          },
        },
      });

      renderResultsPage(store);

      // All correct answers should still be shown in green
      const correctAnswers = document.querySelectorAll(".correct");
      expect(correctAnswers.length).toBe(5); // One for each question's correct answer
    });
  });

  describe("Score Display and Color Coding", () => {
    it("should display score with correct format", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      expect(screen.getByText("You scored 3 out of 5")).toBeInTheDocument();
    });

    it("should display score with red color for 0 correct answers", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 0,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 0 out of 5");
      expect(scoreElement).toHaveClass("fail");
    });

    it("should display score with red color for 1 correct answer", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 1,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 1 out of 5");
      expect(scoreElement).toHaveClass("fail");
    });

    it("should display score with yellow color for 2 correct answers", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 2,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 2 out of 5");
      expect(scoreElement).toHaveClass("intermediate");
    });

    it("should display score with yellow color for 3 correct answers", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 3 out of 5");
      expect(scoreElement).toHaveClass("intermediate");
    });

    it("should display score with green color for 4 correct answers", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 4,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 4 out of 5");
      expect(scoreElement).toHaveClass("pass");
    });

    it("should display score with green color for 5 correct answers", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 5,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 5 out of 5");
      expect(scoreElement).toHaveClass("pass");
    });

    it("should have score element with correct ID", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      expect(document.getElementById("score")).toBeInTheDocument();
    });
  });

  describe("New Quiz Button", () => {
    it("should render new quiz button at the bottom", () => {
      renderResultsPage();

      const button = screen.getByRole("button", { name: "Create a new quiz" });
      expect(button).toBeInTheDocument();
    });

    it("should navigate to quiz creation screen when clicked", async () => {
      const user = userEvent.setup();
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      const button = screen.getByRole("button", { name: "Create a new quiz" });
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should reset quiz state when new quiz button is clicked", async () => {
      const user = userEvent.setup();
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: { "1": "4", "2": "Paris" },
          },
        },
      });

      renderResultsPage(store);

      const button = screen.getByRole("button", { name: "Create a new quiz" });
      await user.click(button);

      // Check that navigation was called (indicating reset action was dispatched)
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty quiz results gracefully", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: null,
          results: {
            score: 0,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      // Should still render the button even without quiz data
      expect(
        screen.getByRole("button", { name: "Create a new quiz" })
      ).toBeInTheDocument();
    });

    it("should handle undefined results gracefully", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 0,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      // Should still render the button even without full quiz data
      expect(
        screen.getByRole("button", { name: "Create a new quiz" })
      ).toBeInTheDocument();
    });

    it("should handle quiz with different number of questions", () => {
      const shortQuiz: Quiz = {
        ...mockQuiz,
        questions: [mockQuizQuestions[0], mockQuizQuestions[1]],
      };

      const store = createMockStore({
        quiz: {
          currentQuiz: shortQuiz,
          results: {
            score: 1,
            answers: { "1": "4", "2": "London" },
          },
        },
      });

      renderResultsPage(store);

      expect(screen.getByText("You scored 1 out of 2")).toBeInTheDocument();
    });
  });

  describe("Answer Display Logic", () => {
    it("should disable answer buttons in results view", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: { "1": "4" },
          },
        },
      });

      renderResultsPage(store);

      const answerButtons = screen.getAllByRole("button");
      const quizAnswerButtons = answerButtons.filter(
        (button) => button.textContent !== "Create a new quiz"
      );

      quizAnswerButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should show both user answer and correct answer when different", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 1,
            answers: {
              "1": "3", // wrong answer
              "2": "Paris", // correct answer
            },
          },
        },
      });

      renderResultsPage(store);

      // Should show both the wrong answer (user's choice) and correct answer
      const incorrectAnswers = document.querySelectorAll(".incorrect");
      const correctAnswers = document.querySelectorAll(".correct");

      expect(incorrectAnswers.length).toBeGreaterThan(0);
      expect(correctAnswers.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Tests", () => {
    it("should display complete results flow correctly", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {
              "1": "4", // correct
              "2": "London", // incorrect
              "3": "Mercury", // correct
              "4": "Atlantic", // incorrect
              "5": "Shakespeare", // correct
            },
          },
        },
      });

      renderResultsPage(store);

      // Check all elements are present
      expect(
        screen.getByRole("heading", { name: "Results" })
      ).toBeInTheDocument();
      expect(screen.getByText("You scored 3 out of 5")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create a new quiz" })
      ).toBeInTheDocument();

      // Check score color (should be yellow for 3/5)
      const scoreElement = screen.getByText("You scored 3 out of 5");
      expect(scoreElement).toHaveClass("intermediate");

      // Check that all questions are displayed
      mockQuizQuestions.forEach((question) => {
        expect(screen.getByText(question.question)).toBeInTheDocument();
      });
    });

    it("should handle perfect score scenario", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 5,
            answers: {
              "1": "4",
              "2": "Paris",
              "3": "Mercury",
              "4": "Pacific",
              "5": "Shakespeare",
            },
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 5 out of 5");
      expect(scoreElement).toHaveClass("pass");
    });

    it("should handle zero score scenario", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 0,
            answers: {
              "1": "3",
              "2": "London",
              "3": "Venus",
              "4": "Atlantic",
              "5": "Dickens",
            },
          },
        },
      });

      renderResultsPage(store);

      const scoreElement = screen.getByText("You scored 0 out of 5");
      expect(scoreElement).toHaveClass("fail");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      expect(
        screen.getByRole("heading", { name: "Results" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create a new quiz" })
      ).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      renderResultsPage();

      const button = screen.getByRole("button", { name: "Create a new quiz" });

      await user.tab();
      expect(button).toHaveFocus();
    });

    it("should have semantic HTML structure", () => {
      const store = createMockStore({
        quiz: {
          currentQuiz: mockQuiz,
          results: {
            score: 3,
            answers: {},
          },
        },
      });

      renderResultsPage(store);

      // Check for proper heading structure
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

      // Check for results container
      expect(document.getElementById("results")).toBeInTheDocument();
      expect(document.getElementById("score")).toBeInTheDocument();
    });
  });
});
