import i18next from "i18next";
import Backend, { HttpBackendOptions } from "i18next-http-backend";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./theme/ThemeProvider";
import { Layout } from "./components";
import {
  AutoTestCaseGeneration,
  ManualTestCaseGeneration,
  TestCaseCommit,
  TestPlanGeneration,
  TestCaseOptimization,
  TestCaseValidation,
  DefectAnalysis,
} from "./pages";
import "./App.scss";
import {
  TO_ANALYZE_DEFECT,
  TO_COMMIT_TEST_CASE,
  TO_GENERATE_AUTO_TEST_CASE,
  TO_GENERATE_MANUAL_TEST_CASE,
  TO_GENERATE_TEST_PLAN,
  TO_OPTIMIZE_TEST_CASE,
  TO_VALIDATE_TEST_CASE,
} from "./utils";

i18next.use(Backend).init<HttpBackendOptions>({
  backend: {
    loadPath: "/translations/{{lng}}.json",
  },
  debug: true,
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

const App = () => {
  return (
    <I18nextProvider i18n={i18next}>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path={TO_ANALYZE_DEFECT} element={<DefectAnalysis />} />
              <Route path={TO_COMMIT_TEST_CASE} element={<TestCaseCommit />} />
              <Route
                path={TO_GENERATE_MANUAL_TEST_CASE}
                element={<ManualTestCaseGeneration />}
              />
              <Route
                path={TO_GENERATE_AUTO_TEST_CASE}
                element={<AutoTestCaseGeneration />}
              />
              <Route
                path={TO_GENERATE_TEST_PLAN}
                element={<TestPlanGeneration />}
              />
              <Route
                path={TO_OPTIMIZE_TEST_CASE}
                element={<TestCaseOptimization />}
              />
              <Route
                path={TO_VALIDATE_TEST_CASE}
                element={<TestCaseValidation />}
              />
              <Route path={"*"} element={<ManualTestCaseGeneration />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
