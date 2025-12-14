import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@snack-uikit/card";
import { Divider } from "@snack-uikit/divider";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import {
  copyToClipboard,
  unwrapMarkdownCodeFence,
  getClassNameByPriority,
  wrapInMarkdownCodeFence,
  GenerateManualTestCaseResponse,
} from "../../utils";
import styles from "./ManualTestCaseGenerationResult.module.scss";

interface ManualTestCaseGenerationResultProps {
  result: GenerateManualTestCaseResponse;
}

export const ManualTestCaseGenerationResult = ({
  result,
}: ManualTestCaseGenerationResultProps) => {
  const { test_case, generation_time, model_used } = result;
  const [code, setCode] = useState(wrapInMarkdownCodeFence(test_case.code));
  const { t, i18n } = useTranslation();

  return (
    <Card className={styles.resultCard}>
      <Typography
        family="mono"
        purpose="title"
        size="m"
        className={styles.resultTitle}
      >
        {t("manual_test_case_generation.result.title")}
      </Typography>

      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("manual_test_case_generation.result.generation_time")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {generation_time.toFixed(2)}s
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("manual_test_case_generation.result.model_used")}
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
            {t("manual_test_case_generation.result.test_case.title")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.title}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            {t("manual_test_case_generation.result.test_case.feature")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.feature}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            {t("manual_test_case_generation.result.test_case.story")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {test_case.story}
          </Typography>
        </div>
        <div className={styles.infoRow}>
          <Typography family="mono" purpose="body" size="s">
            {t("manual_test_case_generation.result.test_case.priority")}
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
          {t("manual_test_case_generation.result.test_case.steps.title")}
        </Typography>
        {test_case.steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <Typography family="mono" purpose="body" size="m">
              {t(
                "manual_test_case_generation.result.test_case.steps.step_number",
              )}{" "}
              {step.step_number}: {step.description}
            </Typography>
            <Typography family="mono" purpose="body" size="s">
              {t(
                "manual_test_case_generation.result.test_case.steps.expected_result",
              )}{" "}
              {step.expected_result}
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
          {t("manual_test_case_generation.result.test_case.code.title")}
        </Typography>
        <MarkdownEditor
          className={styles.code}
          resizable
          defaultMode="view"
          onChange={setCode}
          value={code}
          onCodeCopyClick={() =>
            copyToClipboard(unwrapMarkdownCodeFence(code), i18n.language)
          }
        />
        <button
          className={styles.copyButton}
          onClick={() =>
            copyToClipboard(unwrapMarkdownCodeFence(code), i18n.language)
          }
        >
          {t("manual_test_case_generation.result.test_case.code.btn")}
        </button>
      </div>
    </Card>
  );
};
