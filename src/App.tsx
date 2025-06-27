import { useRoutes } from "react-router-dom";
import { QuizPage } from "./pages/QuizPage/QuizPage";
import { ResultsPage } from "./pages/ResultsPage/ResultsPage";

function App() {
  const element = useRoutes([
    { path: "/", element: <QuizPage /> },
    {
      path: "/results",
      element: <ResultsPage />,
    },
  ]);
  return element;
}

export default App;
