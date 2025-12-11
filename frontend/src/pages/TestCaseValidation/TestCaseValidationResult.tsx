import { useTranslation } from "react-i18next";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { Divider } from "@snack-uikit/divider";
import { ValidateTestCaseResponse } from "../../types";
import { getClassNameByPercentage, getClassNameBySeverity } from "../../utils";
import styles from "./TestCaseValidationResult.module.scss";

interface ValidationResultProps {
  result: ValidateTestCaseResponse;
}

export const ValidationResult = ({ result }: ValidationResultProps) => {
  const {
    total_tests,
    valid_tests,
    invalid_tests,
    overall_compliance,
    results,
    summary,
  } = result;
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Card className={styles.summaryCard}>
        <Typography
          family="mono"
          purpose="title"
          size="m"
          className={styles.sectionTitle}
        >
          {t("test_case_validation.result.title")}
        </Typography>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t("test_case_validation.result.total_tests")}
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {total_tests}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t("test_case_validation.result.valid_tests")}
            </Typography>
            <Typography
              className={styles.success}
              family="mono"
              purpose="title"
              size="m"
            >
              {valid_tests}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t("test_case_validation.result.invalid_tests")}
            </Typography>
            <Typography
              className={styles.error}
              family="mono"
              purpose="title"
              size="m"
            >
              {invalid_tests}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t("test_case_validation.result.overall_compliance")}
            </Typography>
            <Typography
              className={getClassNameByPercentage(
                overall_compliance * 100,
                styles,
              )}
              family="mono"
              purpose="title"
              size="m"
            >
              {(overall_compliance * 100).toFixed(1)}%
            </Typography>
          </div>
        </div>

        <Divider />

        <div className={styles.summaryText}>
          <Typography family="mono" purpose="body" size="m">
            {summary}
          </Typography>
        </div>
      </Card>

      <Card>
        <Typography
          family="mono"
          purpose="title"
          size="m"
          className={styles.sectionTitle}
        >
          {t("test_case_validation.result.title2")}
        </Typography>

        {results.map((testResult, index) => (
          <div key={index} className={styles.testResult}>
            <div className={styles.testHeader}>
              <Typography
                family="mono"
                purpose="body"
                size="m"
                className={styles.testId}
              >
                {t("test_case_validation.result.test_id")} {testResult.test_id}
              </Typography>
              <div className={styles.testStatus}>
                {testResult.is_valid ? (
                  <span className={styles.success}>
                    {t("test_case_validation.result.is_valid.success")}
                  </span>
                ) : (
                  <span className={styles.error}>
                    {t("test_case_validation.result.is_valid.error")}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.compliance}>
              <div className={styles.complianceItem}>
                <Typography family="mono" purpose="body" size="s">
                  {t("test_case_validation.result.aaa_compliance")}
                </Typography>
                <span
                  className={
                    testResult.aaa_compliance ? styles.success : styles.error
                  }
                >
                  {testResult.aaa_compliance ? "✓" : "✗"}
                </span>
              </div>
              <div className={styles.complianceItem}>
                <Typography family="mono" purpose="body" size="s">
                  {t("test_case_validation.result.allure_decorators_complete")}
                </Typography>
                <span
                  className={
                    testResult.allure_decorators_complete
                      ? styles.success
                      : styles.error
                  }
                >
                  {testResult.allure_decorators_complete ? "✓" : "✗"}
                </span>
              </div>
              <div className={styles.complianceItem}>
                <Typography family="mono" purpose="body" size="s">
                  {t("test_case_validation.result.structure_valid")}
                </Typography>
                <span
                  className={
                    testResult.structure_valid ? styles.success : styles.error
                  }
                >
                  {testResult.structure_valid ? "✓" : "✗"}
                </span>
              </div>
            </div>

            {testResult.issues.length > 0 && (
              <div className={styles.issues}>
                <Typography
                  family="mono"
                  purpose="body"
                  size="s"
                  className={styles.label}
                >
                  {t("test_case_validation.result.issues")} (
                  {testResult.issues.length}):
                </Typography>
                {testResult.issues.map((issue, i) => (
                  <div key={i} className={styles.issue}>
                    <div className={styles.issueHeader}>
                      <Typography
                        family="mono"
                        purpose="body"
                        size="s"
                        className={getClassNameBySeverity(
                          issue.severity,
                          styles,
                        )}
                      >
                        {issue.severity}
                      </Typography>
                      <Typography family="mono" purpose="body" size="s">
                        {issue.field}
                      </Typography>
                    </div>
                    <Typography family="mono" purpose="body" size="s">
                      {issue.issue}
                    </Typography>
                    <Typography
                      family="mono"
                      purpose="body"
                      size="s"
                      className={styles.recommendation}
                    >
                      → {issue.recommendation}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
};
