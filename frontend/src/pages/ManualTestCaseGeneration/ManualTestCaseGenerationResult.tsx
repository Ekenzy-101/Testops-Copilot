import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { Divider } from "@snack-uikit/divider";
import { GenerateManualTestCaseResponse } from "../../types";
import { getClassNameByPriority } from "../../utils";
import styles from "./ManualTestCaseGenerationResult.module.scss";

interface ManualTestCaseGenerationResultProps {
  result: GenerateManualTestCaseResponse;
}

export const ManualTestCaseGenerationResult = ({
  result,
}: ManualTestCaseGenerationResultProps) => {
  const { test_case, generation_time, model_used } = result;

  return (
    <Card className={styles.resultCard}>
      <Typography
        family="mono"
        purpose="title"
        size="m"
        className={styles.resultTitle}
      >
        Generated Test Case
      </Typography>

      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Generation Time:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {generation_time.toFixed(2)}s
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            Model:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {model_used}
          </Typography>
        </div>
      </div>

      <Divider />

      <div className={styles.testInfo}>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            Title:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.title}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            Feature:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.feature}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            Story:
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.story}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            Priority:
          </Typography>
          <Typography
            className={getClassNameByPriority(test_case.priority, styles)}
            family="mono"
            purpose="body"
            size="m"
          >
            {test_case.priority}
          </Typography>
        </div>
      </div>

      <Divider />

      <div className={styles.steps}>
        <Typography
          family="mono"
          purpose="title"
          size="s"
          className={styles.sectionTitle}
        >
          Test Steps
        </Typography>
        {test_case.steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <Typography
              family="mono"
              purpose="body"
              size="m"
              className={styles.stepNumber}
            >
              Step {step.step_number}:
            </Typography>
            <Typography family="mono" purpose="body" size="m">
              {step.description}
            </Typography>
            <Typography
              family="mono"
              purpose="body"
              size="s"
              className={styles.expectedResult}
            >
              Expected: {step.expected_result}
            </Typography>
          </div>
        ))}
      </div>

      <Divider />

      <div className={styles.codeSection}>
        <Typography
          family="mono"
          purpose="title"
          size="s"
          className={styles.sectionTitle}
        >
          Generated Code
        </Typography>
        <pre className={styles.code}>
          <code>{test_case.code}</code>
        </pre>
        <button
          className={styles.copyButton}
          onClick={() => {
            navigator.clipboard.writeText(test_case.code);
          }}
        >
          Copy Code
        </button>
      </div>
    </Card>
  );
};
