import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services/api";
import { OptimizationRequest } from "../../types/api";
import { OptimizationResult } from "./OptimizationResult";
import styles from "./Optimization.module.scss";

export const Optimization = () => {
  const [testCases, setTestCases] = useState("");
  const [requirements, setRequirements] = useState("");
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
      const request: OptimizationRequest = {
        test_cases: testCasesList,
        requirements,
      };

      const response = await apiClient.optimizeTestCases(request);
      setResult(response);
    } catch (err: any) {
      toast.error(err?.message || "Failed to optimize test cases");
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
        Optimize Test Cases
      </Typography>
      <Typography
        family="mono"
        purpose="body"
        size="m"
        className={styles.subtitle}
      >
        Analyze test coverage, find duplicates, identify gaps, and get
        optimization suggestions
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            className={styles.formGroup}
            label="Requirements"
            value={requirements}
            onChange={setRequirements}
            placeholder="Enter requirements description..."
            minRows={6}
            required
          />
          <FieldTextArea
            className={styles.formGroup}
            label="Test Cases (separate multiple test cases with '---' on a new line)"
            value={testCases}
            onChange={setTestCases}
            placeholder="Paste test case code...&#10;&#10;---&#10;&#10;Paste another test case..."
            minRows={12}
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={loading ? "Analyzing..." : "Analyze & Optimize"}
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

      {result && <OptimizationResult result={result} />}
    </div>
  );
};
