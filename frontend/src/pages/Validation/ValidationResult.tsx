/** Validation result display */
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { Divider } from "@snack-uikit/divider";
import { ValidationReport } from "../../types/api";
import styles from "./ValidationResult.module.scss";
import { getClassNameByPercentage, getClassNameBySeverity } from "../../utils";

interface ValidationResultProps {
  result: ValidationReport;
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

  return (
    <div className={styles.container}>
      <Card className={styles.summaryCard}>
        <Typography
          family="mono"
          purpose="title"
          size="m"
          className={styles.sectionTitle}
        >
          Validation Summary
        </Typography>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              Total Tests
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {total_tests}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              Valid
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
              Invalid
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
              Compliance
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
          Test Results
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
                Test {testResult.test_id}
              </Typography>
              <div className={styles.testStatus}>
                {testResult.is_valid ? (
                  <span className={styles.success}>✓ Valid</span>
                ) : (
                  <span className={styles.error}>✗ Invalid</span>
                )}
              </div>
            </div>

            <div className={styles.compliance}>
              <div className={styles.complianceItem}>
                <Typography family="mono" purpose="body" size="s">
                  AAA Pattern:
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
                  Allure Decorators:
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
                  Structure:
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
                  Issues ({testResult.issues.length}):
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
