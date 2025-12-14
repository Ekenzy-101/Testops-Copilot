import { useTranslation } from "react-i18next";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import {
  getClassNameByPercentage,
  getClassNameBySeverity,
  OptimizeTestCaseResponse,
} from "../../utils";
import styles from "./TestCaseOptimizationResult.module.scss";

interface OptimizationResultProps {
  result: OptimizeTestCaseResponse;
}

export const TestCaseOptimizationResult = ({
  result,
}: OptimizationResultProps) => {
  const {
    coverage_analysis,
    duplicates,
    coverage_gaps,
    suggestions,
    outdated_tests,
    conflicting_tests,
  } = result;
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Card>
        <Typography
          family="mono"
          purpose="title"
          size="m"
          className={styles.sectionTitle}
        >
          {t("test_case_optimization.result.coverage_analysis.title")}
        </Typography>

        <div className={styles.coverageStats}>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t(
                "test_case_optimization.result.coverage_analysis.total_functionality",
              )}
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {coverage_analysis.total_functionality}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t(
                "test_case_optimization.result.coverage_analysis.covered_functionality",
              )}
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {coverage_analysis.covered_functionality}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              {t(
                "test_case_optimization.result.coverage_analysis.coverage_percentage",
              )}
            </Typography>
            <Typography
              className={getClassNameByPercentage(
                coverage_analysis.coverage_percentage,
                styles,
              )}
              family="mono"
              purpose="title"
              size="m"
            >
              {coverage_analysis.coverage_percentage.toFixed(1)}%
            </Typography>
          </div>
        </div>

        {coverage_analysis.uncovered_areas.length > 0 && (
          <div className={styles.uncovered}>
            <Typography
              family="mono"
              purpose="body"
              size="m"
              className={styles.label}
            >
              {t(
                "test_case_optimization.result.coverage_analysis.uncovered_areas",
              )}
            </Typography>
            <ul className={styles.list}>
              {coverage_analysis.uncovered_areas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {duplicates.length > 0 && (
        <Card>
          <Typography
            family="mono"
            purpose="title"
            size="m"
            className={styles.sectionTitle}
          >
            {t("test_case_optimization.result.duplicates.title")} (
            {duplicates.length})
          </Typography>
          {duplicates.map((dup, index) => (
            <div key={index} className={styles.duplicate}>
              <Typography family="mono" purpose="body" size="m">
                {t("test_case_optimization.result.duplicates.test_id")}{" "}
                {dup.test_id_1} ↔{" "}
                {t("test_case_optimization.result.duplicates.test_id")}{" "}
                {dup.test_id_2}
              </Typography>
              <Typography family="mono" purpose="body" size="s">
                {t("test_case_optimization.result.duplicates.similarity_score")}{" "}
                {(dup.similarity_score * 100).toFixed(1)}%
              </Typography>
              <Typography family="mono" purpose="body" size="s">
                {t("test_case_optimization.result.duplicates.reason")}{" "}
                {dup.reason}
              </Typography>
              <Typography
                family="mono"
                purpose="body"
                size="s"
                className={styles.recommendation}
              >
                {t("test_case_optimization.result.duplicates.recommendation")}{" "}
                {dup.recommendation}
              </Typography>
            </div>
          ))}
        </Card>
      )}

      {coverage_gaps.length > 0 && (
        <Card>
          <Typography
            family="mono"
            purpose="title"
            size="m"
            className={styles.sectionTitle}
          >
            {t("test_case_optimization.result.coverage_gaps.title")} (
            {coverage_gaps.length})
          </Typography>
          {coverage_gaps.map((gap, index) => (
            <div key={index} className={styles.gap}>
              <div className={styles.gapHeader}>
                <Typography family="mono" purpose="body" size="m">
                  {gap.functionality}
                </Typography>
                <Typography
                  family="mono"
                  purpose="body"
                  size="s"
                  className={getClassNameBySeverity(gap.severity, styles)}
                >
                  {gap.severity}
                </Typography>
              </div>
              <Typography family="mono" purpose="body" size="s">
                {gap.description}
              </Typography>
              {gap.suggested_tests.length > 0 && (
                <div className={styles.suggestedTests}>
                  <Typography
                    family="mono"
                    purpose="body"
                    size="s"
                    className={styles.label}
                  >
                    {t(
                      "test_case_optimization.result.coverage_gaps.suggested_tests",
                    )}
                  </Typography>
                  <ul className={styles.list}>
                    {gap.suggested_tests.map((test, i) => (
                      <li key={i}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card>
          <Typography
            family="mono"
            purpose="title"
            size="m"
            className={styles.sectionTitle}
          >
            {t("test_case_optimization.result.suggestions.title")} (
            {suggestions.length})
          </Typography>
          {suggestions.map((suggestion, index) => (
            <div key={index} className={styles.suggestion}>
              <Typography family="mono" purpose="body" size="m">
                {suggestion.description}
              </Typography>
              <div className={styles.suggestionMeta}>
                <Typography family="mono" purpose="body" size="s">
                  {t("test_case_optimization.result.suggestions.impact")}{" "}
                  {suggestion.impact}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  {t("test_case_optimization.result.suggestions.effort")}{" "}
                  {suggestion.effort}
                </Typography>
              </div>
            </div>
          ))}
        </Card>
      )}

      {(outdated_tests.length > 0 || conflicting_tests.length > 0) && (
        <Card>
          <Typography
            family="mono"
            purpose="title"
            size="m"
            className={styles.sectionTitle}
          >
            {t("test_case_optimization.result.issues.title")}
          </Typography>
          {outdated_tests.length > 0 && (
            <div className={styles.issueSection}>
              <Typography
                family="mono"
                purpose="body"
                size="m"
                className={styles.label}
              >
                {t("test_case_optimization.result.issues.outdated_tests")}
              </Typography>
              <ul className={styles.list}>
                {outdated_tests.map((testId, index) => (
                  <li key={index}>Test {testId}</li>
                ))}
              </ul>
            </div>
          )}
          {conflicting_tests.length > 0 && (
            <div className={styles.issueSection}>
              <Typography
                family="mono"
                purpose="body"
                size="m"
                className={styles.label}
              >
                {t("test_case_optimization.result.issues.conflicting_tests")}
              </Typography>
              <ul className={styles.list}>
                {conflicting_tests.map((testId, index) => (
                  <li key={index}>Test {testId}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
