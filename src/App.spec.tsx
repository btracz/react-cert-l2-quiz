import { render } from "@testing-library/react";
import App from "./App";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

jest.mock("./pages/QuizPage/QuizPage", () => ({
  QuizPage: () => <div>QuizPage</div>,
}));
jest.mock("./pages/ResultsPage/ResultsPage", () => ({
  ResultsPage: () => <div>ResultsPage</div>,
}));

describe("App", () => {
  afterAll(() => {
    // Clear any previous mocks or state if necessary
    jest.clearAllMocks();
  });
  it("should render home ok", () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(container.innerHTML).toContain("QuizPage");
  });

  it("should render results ok", () => {
    const { container } = render(
      <MemoryRouter initialEntries={[`/results`]}>
        <App />
      </MemoryRouter>
    );
    expect(container.innerHTML).toContain("ResultsPage");
  });
});
