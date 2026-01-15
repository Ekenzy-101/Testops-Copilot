import { test_case_validation as translation } from "../../translations/en/translation.json";
import { render, screen } from "../../utils/test";
import { ValidationResult } from "./TestCaseValidationResult";

test("should render ValidationResult correctly", async () => {
  const result = {
    invalid_tests: 0,
    valid_tests: 1,
    overall_compliance: 1,
    results: [
      {
        aaa_compliance: true,
        allure_decorators_complete: true,
        is_valid: true,
        issues: [],
        structure_valid: true,
        test_id: "1",
      },
    ],
    summary: "Test",
    total_tests: 1,
  };
  render(<ValidationResult result={result} />);

  expect(screen.getByTestId("title")).toHaveTextContent(
    translation.result.title,
  );
  expect(screen.getByTestId("overall_compliance")).toHaveTextContent("100.0%");
  expect(screen.getByTestId("total_tests")).toHaveTextContent("1");
});
