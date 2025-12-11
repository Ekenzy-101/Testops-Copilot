import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { Checkbox } from "@snack-uikit/toggles";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import { ValidateTestCaseRequest } from "../../types";
import { ValidationResult } from "./TestCaseValidationResult";
import styles from "./TestCaseValidation.module.scss";

export const TestCaseValidation = () => {
  const [testCases, setTestCases] = useState("");
  const [strictMode, setStrictMode] = useState(false);
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
      const request: ValidateTestCaseRequest = {
        test_cases: testCasesList,
        strict_mode: strictMode,
      };

      const response = await apiClient.validateTestCases(request);
      setResult(response);
      toast.success(t("test_case_validation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_validation.result.error"));
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
        {t("test_case_validation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_case_validation.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            className={styles.formGroup}
            label={t("test_case_validation.test_cases.label")}
            placeholder={t("test_case_validation.test_cases.placeholder")}
            value={testCases}
            onChange={setTestCases}
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
                {t("test_case_validation.strict_mode.label")}
              </Typography>
            </label>
          </div>
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("test_case_validation.btn.label_loading")
                : t("test_case_validation.btn.label")
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

      {result && <ValidationResult result={result} />}
    </div>
  );
};
