/** Test case validation page */
import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { Checkbox } from "@snack-uikit/toggles";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services/api";
import { ValidationRequest } from "../../types/api";
import { ValidationResult } from "./ValidationResult";
import styles from "./Validation.module.scss";

export const Validation = () => {
  const [testCases, setTestCases] = useState("");
  const [strictMode, setStrictMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const testCasesList = testCases
        .split("\n---\n")
        .filter((tc) => tc.trim());
      const request: ValidationRequest = {
        test_cases: testCasesList,
        strict_mode: strictMode,
      };

      const response = await apiClient.validateTestCases(request);
      setResult(response);
    } catch (err: any) {
      toast(err?.message || "Failed to validate test cases");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Typography
        family="mono"
        purpose="title"
        size="l"
        className={styles.title}
      >
        Validate Test Cases
      </Typography>
      <Typography
        family="mono"
        purpose="body"
        size="m"
        className={styles.subtitle}
      >
        Validate test cases against Allure standards and AAA pattern
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            className={styles.formGroup}
            label="Test Cases (separate multiple test cases with '---' on a new line)"
            value={testCases}
            onChange={setTestCases}
            placeholder="Paste test case code...&#10;&#10;---&#10;&#10;Paste another test case..."
            minRows={12}
            required
          />
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <Checkbox
                checked={strictMode}
                onChange={setStrictMode}
                className={styles.checkbox}
              />
              <Typography family="mono" purpose="body" size="m">
                Strict validation mode
              </Typography>
            </label>
          </div>
          <ButtonFilled
            className={styles.actions}
            label={loading ? "Validating..." : "Validate Test Cases"}
            onClick={handleSubmit}
            disabled={loading}
            type="submit"
          />
        </form>
      </Card>

      {loading && (
        <div className={styles.loader}>
          <Spinner size="l" />
        </div>
      )}

      {result && <ValidationResult result={result} />}
    </div>
  );
};
