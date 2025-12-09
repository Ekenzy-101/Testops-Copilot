import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { OptimizationReport } from "../../types/api";
import styles from "./OptimizationResult.module.scss";
import { getClassNameByPercentage, getClassNameBySeverity } from "../../utils";

interface OptimizationResultProps {
  result: OptimizationReport;
}

export const OptimizationResult = ({ result }: OptimizationResultProps) => {
  const {
    coverage_analysis,
    duplicates,
    coverage_gaps,
    suggestions,
    outdated_tests,
    conflicting_tests,
  } = result;

  return (
    <div className={styles.container}>
      <Card>
        <Typography
          family="mono"
          purpose="title"
          size="m"
          className={styles.sectionTitle}
        >
          Coverage Analysis
        </Typography>

        <div className={styles.coverageStats}>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              Total Functionality
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {coverage_analysis.total_functionality}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              Covered
            </Typography>
            <Typography family="mono" purpose="title" size="m">
              {coverage_analysis.covered_functionality}
            </Typography>
          </div>
          <div className={styles.stat}>
            <Typography family="mono" purpose="body" size="s">
              Coverage
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
              Uncovered Areas:
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
            Duplicate Tests ({duplicates.length})
          </Typography>
          {duplicates.map((dup, index) => (
            <div key={index} className={styles.duplicate}>
              <Typography family="mono" purpose="body" size="m">
                Test {dup.test_id_1} ↔ Test {dup.test_id_2}
              </Typography>
              <Typography family="mono" purpose="body" size="s">
                Similarity: {(dup.similarity_score * 100).toFixed(1)}%
              </Typography>
              <Typography family="mono" purpose="body" size="s">
                Reason: {dup.reason}
              </Typography>
              <Typography
                family="mono"
                purpose="body"
                size="s"
                className={styles.recommendation}
              >
                Recommendation: {dup.recommendation}
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
            Coverage Gaps ({coverage_gaps.length})
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
                    Suggested Tests:
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
            Optimization Suggestions ({suggestions.length})
          </Typography>
          {suggestions.map((suggestion, index) => (
            <div key={index} className={styles.suggestion}>
              <Typography family="mono" purpose="body" size="m">
                {suggestion.description}
              </Typography>
              <div className={styles.suggestionMeta}>
                <Typography family="mono" purpose="body" size="s">
                  Impact: {suggestion.impact}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  Effort: {suggestion.effort}
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
            Issues
          </Typography>
          {outdated_tests.length > 0 && (
            <div className={styles.issueSection}>
              <Typography
                family="mono"
                purpose="body"
                size="m"
                className={styles.label}
              >
                Outdated Tests:
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
                Conflicting Tests:
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
