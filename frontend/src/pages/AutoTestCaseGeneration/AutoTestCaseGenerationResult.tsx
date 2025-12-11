import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@snack-uikit/card";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import { Divider } from "@snack-uikit/divider";
import {
  copyToClipboard,
  extractContentInMarkdown,
  wrapContentInMarkdown,
} from "../../utils";
import { GenerateAutoTestCaseResponse } from "../../types";
import styles from "./AutoTestCaseGenerationTestResult.module.scss";

interface TestResultProps {
  result: GenerateAutoTestCaseResponse;
}

export const AutoTestCaseGenerationResult = ({ result }: TestResultProps) => {
  const { t, i18n } = useTranslation();
  const [code, setCode] = useState(wrapContentInMarkdown(result.test_code));

  return (
    <Card className={styles.resultCard}>
      <Typography
        family="mono"
        purpose="title"
        size="m"
        className={styles.resultTitle}
      >
        {t("auto_test_case_generation.result.title")}
      </Typography>

      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("auto_test_case_generation.result.test_count")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.test_count}
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("auto_test_case_generation.result.framework")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.framework}
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("auto_test_case_generation.result.generation_time")}
          </Typography>
          <Typography family="mono" purpose="body" size="m">
            {result.generation_time.toFixed(2)}s
          </Typography>
        </div>
        <div className={styles.metadataItem}>
          <Typography family="mono" purpose="body" size="s">
            {t("auto_test_case_generation.result.model_used")}
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
              {t("auto_test_case_generation.result.dependencies")}
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
          {t("auto_test_case_generation.result.code.title")}
        </Typography>
        <MarkdownEditor
          className={styles.code}
          resizable
          defaultMode="view"
          onChange={setCode}
          value={code}
          onCodeCopyClick={() =>
            copyToClipboard(extractContentInMarkdown(code), i18n.language)
          }
        />
        <button
          className={styles.copyButton}
          onClick={() =>
            copyToClipboard(extractContentInMarkdown(code), i18n.language)
          }
        >
          {t("auto_test_case_generation.result.code.btn")}
        </button>
      </div>
    </Card>
  );
};
