import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Layout } from "./components";
import {
  AutomatedTests,
  Optimization,
  TestCaseGeneration,
  Validation,
  GitLabCommit,
  TestPlan,
  DefectInsights,
} from "./pages";
import "./App.scss";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<TestCaseGeneration />} />
            <Route path="/automated-tests" element={<AutomatedTests />} />
            <Route path="/optimization" element={<Optimization />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/gitlab" element={<GitLabCommit />} />
            <Route path="/test-plan" element={<TestPlan />} />
            <Route path="/defects" element={<DefectInsights />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
