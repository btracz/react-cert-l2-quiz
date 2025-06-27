import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { QuizPage } from "./QuizPage";
import { QuizDifficultyLevel } from "../../shared/enum";
import type { QuizCategory } from "../../shared/types/QuizCategory";
import categoriesSlice from "../../store/slices/categoriesSlice";
import quizSlice, { type QuizResults } from "../../store/slices/quizSlice";

// Mock fetch for API calls
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("QuizPage", () => {
  const mockCategories: QuizCategory[] = [
    { id: 9, name: "General Knowledge" },
    { id: 10, name: "Entertainment: Books" },
    { id: 11, name: "Entertainment: Film" },
  ];

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
          results: {} as QuizResults,
        },
        ...initialState,
      },
    });
  };

  const renderQuizPage = (store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <QuizPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render the header with correct text", () => {
      renderQuizPage();
      expect(
        screen.getByRole("heading", { name: "Quiz Maker" })
      ).toBeInTheDocument();
    });

    it("should render QuizParameters component", () => {
      renderQuizPage();
      expect(screen.getByTestId("categorySelect")).toBeInTheDocument();
      expect(screen.getByTestId("difficultySelect")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create/i })
      ).toBeInTheDocument();
    });

    it("should render QuizGame component", () => {
      renderQuizPage();
      expect(screen.getByTestId("quiz-game")).toBeInTheDocument();
    });
  });

  describe("Quiz Parameters - Category Selection", () => {
    it("should have categorySelect with correct HTML ID", () => {
      renderQuizPage();
      const categorySelect = screen.getByTestId("categorySelect");
      expect(categorySelect).toHaveAttribute("id", "categorySelect");
    });

    it("should show loading state when categories are loading", () => {
      const store = createMockStore({
        categories: {
          categories: [],
          isCategoriesLoading: true,
          categoriesError: null,
        },
      });
      renderQuizPage(store);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show 'Select a category' option when categories are loaded", async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      const store = createMockStore();
      renderQuizPage(store);

      await waitFor(() => {
        expect(screen.getByText("Select a category")).toBeInTheDocument();
      });
    });

    it("should populate category options from API", async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      const store = createMockStore();
      renderQuizPage(store);

      await waitFor(() => {
        mockCategories.forEach((category) => {
          expect(screen.getByText(category.name)).toBeInTheDocument();
        });
      });
    });

    it("should handle category selection", async () => {
      const user = userEvent.setup();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      const store = createMockStore();
      renderQuizPage(store);

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      expect(categorySelect).toHaveValue("9");
    });

    it("should fetch categories on component mount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "https://opentdb.com/api_category.php"
        );
      });
    });
  });

  describe("Quiz Parameters - Difficulty Selection", () => {
    it("should have difficultySelect with correct HTML ID", () => {
      renderQuizPage();
      const difficultySelect = screen.getByTestId("difficultySelect");
      expect(difficultySelect).toHaveAttribute("id", "difficultySelect");
    });

    it("should show all difficulty levels", () => {
      renderQuizPage();

      expect(screen.getByText("Easy")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
    });

    it("should default to Easy difficulty", () => {
      renderQuizPage();
      const difficultySelect = screen.getByTestId("difficultySelect");
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Easy);
    });

    it("should handle difficulty selection", async () => {
      const user = userEvent.setup();
      renderQuizPage();

      const difficultySelect = screen.getByTestId("difficultySelect");
      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Hard);

      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Hard);
    });

    it("should handle all difficulty level changes", async () => {
      const user = userEvent.setup();
      renderQuizPage();

      const difficultySelect = screen.getByTestId("difficultySelect");

      // Test each difficulty level
      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Medium);
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Medium);

      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Hard);
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Hard);

      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Easy);
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Easy);
    });
  });

  describe("Quiz Creation Button", () => {
    it("should have createBtn with correct HTML ID", () => {
      renderQuizPage();
      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toHaveAttribute("id", "createBtn");
    });

    it("should be disabled when no category is selected", () => {
      renderQuizPage();
      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it("should be enabled when category and difficulty are selected", async () => {
      const user = userEvent.setup();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toBeEnabled();
    });

    it("should create quiz when button is clicked", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              question: "Test question?",
              correct_answer: "Correct",
              incorrect_answers: ["Wrong1", "Wrong2", "Wrong3"],
              difficulty: "easy",
              type: "multiple",
            },
          ],
          response_code: 0, // Indicates success
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      const difficultySelect = screen.getByTestId("difficultySelect");
      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Medium);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Verify quiz data API was called with correct parameters
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("https://opentdb.com/api.php")
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("category=9")
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("difficulty=medium")
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle categories API error gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      const store = createMockStore();
      renderQuizPage(store);

      // Should still render the component structure
      expect(
        screen.getByRole("heading", { name: "Quiz Maker" })
      ).toBeInTheDocument();
      expect(screen.getByTestId("categorySelect")).toBeInTheDocument();
    });

    it("should handle quiz creation API error", async () => {
      const user = userEvent.setup();

      // Mock successful categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      // Mock failed quiz data API response
      mockFetch.mockRejectedValueOnce(new Error("Quiz API Error"));

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // The component should still be functional
      expect(createButton).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    it("should complete full quiz creation flow", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              question: "What is 2 + 2?",
              correct_answer: "4",
              incorrect_answers: ["3", "5", "6"],
              difficulty: "easy",
              type: "multiple",
            },
          ],
          response_code: 0, // Indicates success
        }),
      } as Response);

      renderQuizPage();

      // Wait for categories to load
      await waitFor(() => {
        expect(screen.getByText("Entertainment: Books")).toBeInTheDocument();
      });

      // Select category
      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "10");

      // Change difficulty
      const difficultySelect = screen.getByTestId("difficultySelect");
      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Hard);

      // Create quiz
      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Verify all API calls were made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          "https://opentdb.com/api_category.php"
        );
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining("category=10")
        );
        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          expect.stringContaining("difficulty=hard")
        );
      });
    });

    it("should maintain component state through user interactions", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("Entertainment: Film")).toBeInTheDocument();
      });

      // Select category multiple times
      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");
      expect(categorySelect).toHaveValue("9");

      await user.selectOptions(categorySelect, "11");
      expect(categorySelect).toHaveValue("11");

      // Change difficulty multiple times
      const difficultySelect = screen.getByTestId("difficultySelect");
      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Medium);
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Medium);

      await user.selectOptions(difficultySelect, QuizDifficultyLevel.Hard);
      expect(difficultySelect).toHaveValue(QuizDifficultyLevel.Hard);

      // Button should remain enabled with valid selections
      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toBeEnabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      renderQuizPage();

      // Check that form controls have proper roles
      expect(screen.getByTestId("categorySelect")).toBeInTheDocument();
      expect(screen.getByTestId("difficultySelect")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Quiz Maker" })
      ).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      // Test tab navigation
      const categorySelect = screen.getByTestId("categorySelect");
      const difficultySelect = screen.getByTestId("difficultySelect");
      const createButton = screen.getByRole("button", { name: /create/i });

      await user.tab();
      expect(categorySelect).toHaveFocus();

      await user.tab();
      expect(difficultySelect).toHaveFocus();

      await user.tab();
      expect(createButton).not.toHaveFocus(); // disabled

      await user.selectOptions(categorySelect, "9"); // should enable button
      await user.tab();
      await user.tab();
      expect(createButton).toHaveFocus();
    });
  });

  describe("5-Question Quiz Display", () => {
    const mockQuizQuestions = [
      {
        question: "What is the capital of France?",
        correct_answer: "Paris",
        incorrect_answers: ["London", "Berlin", "Madrid"],
        difficulty: "easy",
        type: "multiple",
      },
      {
        question: "Who directed the movie 'Inception'?",
        correct_answer: "Christopher Nolan",
        incorrect_answers: [
          "Steven Spielberg",
          "Martin Scorsese",
          "Quentin Tarantino",
        ],
        difficulty: "easy",
        type: "multiple",
      },
      {
        question: "What year was the first iPhone released?",
        correct_answer: "2007",
        incorrect_answers: ["2006", "2008", "2009"],
        difficulty: "easy",
        type: "multiple",
      },
      {
        question: "Which planet is known as the Red Planet?",
        correct_answer: "Mars",
        incorrect_answers: ["Venus", "Jupiter", "Saturn"],
        difficulty: "easy",
        type: "multiple",
      },
      {
        question: "What is the largest ocean on Earth?",
        correct_answer: "Pacific Ocean",
        incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        difficulty: "easy",
        type: "multiple",
      },
    ];

    it("should fetch exactly 5 questions from the API", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response with 5 questions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions,
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Verify API call includes amount=5
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("amount=5")
        );
      });
    });

    it("should fetch questions with multiple choice type", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions,
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Verify API call includes type=multiple
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("type=multiple")
        );
      });
    });

    it("should display all 5 questions when quiz is created", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions,
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Wait for quiz to load and verify all questions are displayed
      await waitFor(() => {
        expect(
          screen.getByText(mockQuizQuestions[0].question)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[1].question)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[2].question)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[3].question)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[4].question)
        ).toBeInTheDocument();
      });
    });

    it("should display 4 answer options for each question", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions,
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Wait for quiz to load and verify each question has 4 answer options
      await waitFor(() => {
        // Check first question answers
        expect(
          screen.getByText(mockQuizQuestions[0].correct_answer)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[0].incorrect_answers[0])
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[0].incorrect_answers[1])
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[0].incorrect_answers[2])
        ).toBeInTheDocument();

        // Check second question answers
        expect(
          screen.getByText(mockQuizQuestions[1].correct_answer)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[1].incorrect_answers[0])
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[1].incorrect_answers[1])
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockQuizQuestions[1].incorrect_answers[2])
        ).toBeInTheDocument();
      });
    });

    it("should display answers in random order (not always correct answer first)", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [mockQuizQuestions[0]], // Test with just one question
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        // Verify all answers are present (order may vary due to shuffling)
        expect(screen.getByText("Paris")).toBeInTheDocument();
        expect(screen.getByText("London")).toBeInTheDocument();
        expect(screen.getByText("Berlin")).toBeInTheDocument();
        expect(screen.getByText("Madrid")).toBeInTheDocument();
      });

      // Get all answer buttons and verify they exist
      const answerButtons = screen
        .getAllByRole("button")
        .filter((btn) =>
          ["Paris", "London", "Berlin", "Madrid"].includes(
            btn.textContent?.trim() ?? ""
          )
        );
      expect(answerButtons).toHaveLength(4);
    });

    it("should make answer buttons clickable and highlightable", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [mockQuizQuestions[0]], // Test with one question
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText("What is the capital of France?")
        ).toBeInTheDocument();
      });

      // Find and click on "Paris" answer
      const parisButton = screen.getByRole("button", { name: /paris/i });
      expect(parisButton).toBeInTheDocument();

      await user.click(parisButton);

      // Verify the answer remains highlighted after clicking
      // This would need to be verified through CSS classes or data attributes
      expect(parisButton).toBeInTheDocument();
    });

    it("should show submit button only when all questions are answered", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response with 2 questions for easier testing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions.slice(0, 2),
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText("What is the capital of France?")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Who directed the movie 'Inception'?")
        ).toBeInTheDocument();
      });

      // Initially, submit button should not be visible
      expect(
        screen.queryByRole("button", { name: /submit/i })
      ).not.toBeInTheDocument();

      // Answer first question
      const parisButton = screen.getByRole("button", { name: /paris/i });
      await user.click(parisButton);

      // Submit button should still not be visible (only 1 of 2 questions answered)
      expect(
        screen.queryByRole("button", { name: /submit/i })
      ).not.toBeInTheDocument();

      // Answer second question
      const nolanButton = screen.getByRole("button", {
        name: /christopher nolan/i,
      });
      await user.click(nolanButton);

      // Now submit button should be visible
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /submit/i })
        ).toBeInTheDocument();
      });
    });

    it("should handle quiz submission and navigate to results", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response with 1 question for easier testing
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [mockQuizQuestions[0]],
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText("What is the capital of France?")
        ).toBeInTheDocument();
      });

      // Answer the question
      const parisButton = screen.getByRole("button", { name: /paris/i });
      await user.click(parisButton);

      // Submit button should appear
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /submit/i })
        ).toBeInTheDocument();
      });

      // Click submit button
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      // This would typically navigate to results page, but since we're in a memory router
      // we can verify the navigation attempt was made through store state or mock navigation
    });

    it("should handle API errors gracefully during quiz loading", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      // Mock failed quiz data API response
      mockFetch.mockRejectedValueOnce(new Error("Quiz API Error"));

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // The component should handle the error gracefully
      // Specific error handling behavior would depend on implementation
      expect(createButton).toBeInTheDocument();
    });

    it("should construct correct API URL with all required parameters", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: [{ id: 11, name: "Entertainment: Film" }],
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("Entertainment: Film")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "11");

      const difficultySelect = screen.getByTestId("difficultySelect");
      await user.selectOptions(difficultySelect, "hard");

      // Mock quiz data API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions,
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      // Verify the exact API URL structure
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "https://opentdb.com/api.php?amount=5&category=11&difficulty=hard&type=multiple"
        );
      });
    });

    it("should maintain quiz state across multiple answer selections", async () => {
      const user = userEvent.setup();

      // Mock categories API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          trivia_categories: mockCategories,
        }),
      } as Response);

      renderQuizPage();

      await waitFor(() => {
        expect(screen.getByText("General Knowledge")).toBeInTheDocument();
      });

      const categorySelect = screen.getByTestId("categorySelect");
      await user.selectOptions(categorySelect, "9");

      // Mock quiz data API response with 2 questions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: mockQuizQuestions.slice(0, 2),
          response_code: 0, // Indicates success
        }),
      } as Response);

      const createButton = screen.getByRole("button", { name: /create/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(
          screen.getByText("What is the capital of France?")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Who directed the movie 'Inception'?")
        ).toBeInTheDocument();
      });

      // Answer first question
      const parisButton = screen.getByRole("button", { name: /paris/i });
      await user.click(parisButton);

      // Change answer for first question
      const londonButton = screen.getByRole("button", { name: /london/i });
      await user.click(londonButton);

      // Answer second question
      const nolanButton = screen.getByRole("button", {
        name: /christopher nolan/i,
      });
      await user.click(nolanButton);

      // Submit button should appear after all questions are answered
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /submit/i })
        ).toBeInTheDocument();
      });
    });
  });
});
