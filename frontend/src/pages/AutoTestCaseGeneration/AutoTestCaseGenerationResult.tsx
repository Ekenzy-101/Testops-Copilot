import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { Divider } from "@snack-uikit/divider";
import { GenerateAutoTestCaseResponse } from "../../types";
import styles from "./AutoTestCaseGenerationTestResult.module.scss";

interface TestResultProps {
  result: GenerateAutoTestCaseResponse;
}

export const AutoTestCaseGenerationResult = ({ result }: TestResultProps) => {
  return (
    <Card className={styles.resultCard}>
      <Typography
        family="mono"
        purpose="title"
        size="m"
        className={styles.resultTitle}
      >
        Generated Automated Tests
      </Typography>

      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Tests Generated:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.test_count}
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Framework:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.framework}
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Generation Time:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.generation_time.toFixed(2)}s
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Model:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.model_used}
          </Typography>
        </div>
      </div>

      {result.dependencies.length > 0 && (
        <>
          <Divider />
          <div className={styles.dependencies}>
            <Typography
              family="mono"
              purpose="title"
              size="s"
              className={styles.sectionTitle}
            >
              Required Dependencies
            </Typography>
            <div className={styles.dependencyList}>
              {result.dependencies.map((dep, index) => (
                <span key={index} className={styles.dependency}>
                  {dep}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <Divider />

      <div className={styles.codeSection}>
        <Typography
          family="mono"
          purpose="title"
          size="s"
          className={styles.sectionTitle}
        >
          Generated Test Code
        </Typography>
        <pre className={styles.code}>
          <code>{result.test_code}</code>
        </pre>
        <button
          className={styles.copyButton}
          onClick={() => {
            navigator.clipboard.writeText(result.test_code);
          }}
        >
          Copy Code
        </button>
      </div>
    </Card>
  );
};
