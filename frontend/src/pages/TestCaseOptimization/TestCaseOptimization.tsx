import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import { OptimizeTestCaseRequest } from "../../types";
import { TestCaseOptimizationResult } from "./TestCaseOptimizationResult";
import styles from "./TestCaseOptimization.module.scss";

export const TestCaseOptimization = () => {
  const [testCases, setTestCases] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const testCasesList = testCases
        .split("\n---\n")
        .filter((tc) => tc.trim());
      const request: OptimizeTestCaseRequest = {
        test_cases: testCasesList,
        requirements,
      };

      const response = await apiClient.optimizeTestCases(request);
      setResult(response);
      toast.success(t("test_case_optimization.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_optimization.result.error"));
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
        {t("test_case_optimization.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_case_optimization.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            className={styles.formGroup}
            label={t("test_case_optimization.requirements.label")}
            placeholder={t("test_case_optimization.requirements.placeholder")}
            value={requirements}
            onChange={setRequirements}
            minRows={6}
            required
          />
          <FieldTextArea
            className={styles.formGroup}
            label={t("test_case_optimization.test_cases.label")}
            placeholder={t("test_case_optimization.test_cases.placeholder")}
            value={testCases}
            onChange={setTestCases}
            minRows={12}
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("test_case_optimization.btn.label_loading")
                : t("test_case_optimization.btn.label")
            }
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

      {result && <TestCaseOptimizationResult result={result} />}
    </div>
  );
};
