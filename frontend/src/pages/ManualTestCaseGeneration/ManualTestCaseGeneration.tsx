import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea, FieldSelect } from "@snack-uikit/fields";
import { Typography } from "@snack-uikit/typography";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import { GenerateManualTestCaseRequest, Priority } from "../../types";
import { ManualTestCaseGenerationResult } from "./ManualTestCaseGenerationResult";
import styles from "./ManualTestCaseGeneration.module.scss";

export const ManualTestCaseGeneration = () => {
  const [formData, setFormData] = useState<GenerateManualTestCaseRequest>({
    requirements: "",
    test_type: "UI",
    feature: "",
    story: "",
    owner: "",
    priority: Priority.NORMAL,
    jira_link: "",
    jira_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.generateManualTestCase(formData);
      setResult(response);
      toast.success(t("manual_test_case_generation.result.success"));
    } catch (err: any) {
      toast.error(
        err?.message || t("manual_test_case_generation.result.error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof GenerateManualTestCaseRequest,
    value: string | Priority,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <Typography
        family="mono"
        purpose="title"
        size="l"
        className={styles.title}
      >
        {t("manual_test_case_generation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("manual_test_case_generation.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <FieldSelect
              className={styles.formGroup}
              label={t("manual_test_case_generation.test_type.label")}
              value={formData.test_type}
              onChange={(value) =>
                handleChange("test_type", value as "UI" | "API")
              }
              options={[
                { value: "UI", option: "UI" },
                { value: "API", option: "API" },
              ]}
              required
            />
            <FieldSelect
              className={styles.formGroup}
              label={t("manual_test_case_generation.priority.label")}
              value={formData.priority}
              onChange={(value) => handleChange("priority", value as Priority)}
              options={[
                { value: Priority.CRITICAL, option: "Critical" },
                { value: Priority.NORMAL, option: "Normal" },
                { value: Priority.LOW, option: "Low" },
              ]}
              required
            />
          </div>
          <FieldTextArea
            className={styles.formGroup}
            label={t("manual_test_case_generation.requirements.label")}
            placeholder={t(
              "manual_test_case_generation.requirements.placeholder",
            )}
            minRows={6}
            onChange={(value: string) => handleChange("requirements", value)}
            required
            value={formData.requirements}
          />
          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.feature.label")}
              placeholder={t("manual_test_case_generation.feature.placeholder")}
              onChange={(value: string) => handleChange("feature", value)}
              required
              value={formData.feature}
            />
            <FieldText
              className={styles.formGroup}
              label={t("manual_test_case_generation.story.label")}
              placeholder={t("manual_test_case_generation.story.placeholder")}
              inputMode="text"
              onChange={(value: string) => handleChange("story", value)}
              required
              value={formData.story}
            />
          </div>
          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.owner.label")}
              placeholder={t("manual_test_case_generation.owner.placeholder")}
              onChange={(value: string) => handleChange("owner", value)}
              required
              value={formData.owner}
            />
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.jira_link.label")}
              placeholder={t(
                "manual_test_case_generation.jira_link.placeholder",
              )}
              value={formData.jira_link}
              onChange={(value: string) => handleChange("jira_link", value)}
            />
          </div>
          <FieldText
            className={styles.formGroup}
            inputMode="text"
            label={t("manual_test_case_generation.jira_name.label")}
            placeholder={t("manual_test_case_generation.jira_name.placeholder")}
            value={formData.jira_name}
            onChange={(value: string) => handleChange("jira_name", value)}
          />
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("manual_test_case_generation.btn.label_loading")
                : t("manual_test_case_generation.btn.label")
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

      {result && <ManualTestCaseGenerationResult result={result} />}
    </div>
  );
};
