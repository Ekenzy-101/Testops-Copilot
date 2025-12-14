import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea, FieldSelect } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import {
  GenerateManualTestCaseSchema,
  GenerateManualTestCaseRequest,
  GenerateManualTestCaseResponse,
  Priority,
  TestType,
} from "../../utils";
import { ManualTestCaseGenerationResult } from "./ManualTestCaseGenerationResult";
import styles from "./ManualTestCaseGeneration.module.scss";

export const ManualTestCaseGeneration = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<GenerateManualTestCaseRequest>({
    resolver: valibotResolver(GenerateManualTestCaseSchema),
    defaultValues: {
      feature: "",
      jira_link: "",
      jira_name: "",
      owner: "",
      priority: Priority.NORMAL,
      requirements: "",
      story: "",
      test_type: TestType.UI,
    },
  });
  const [result, setResult] = useState<GenerateManualTestCaseResponse | null>(
    null,
  );
  const { t } = useTranslation();

  const onSubmit = async (request: GenerateManualTestCaseRequest) => {
    setResult(null);

    try {
      const response = await apiClient.generateManualTestCases(request);
      setResult(response);
      toast.success(t("manual_test_case_generation.result.success"));
    } catch (err: any) {
      toast.error(
        err?.message || t("manual_test_case_generation.result.error"),
      );
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
        {t("manual_test_case_generation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("manual_test_case_generation.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formRow}>
            <FieldSelect
              className={styles.formGroup}
              label={t("manual_test_case_generation.test_type.label")}
              error={errors.test_type?.message}
              value={watch("test_type")}
              onChange={(value) => setValue("test_type", value)}
              options={[
                { value: "UI", option: "UI" },
                { value: "API", option: "API" },
              ]}
              required
            />
            <FieldSelect
              className={styles.formGroup}
              label={t("manual_test_case_generation.priority.label")}
              error={errors.priority?.message}
              value={watch("priority")}
              onChange={(value) => setValue("priority", value)}
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
            error={errors.requirements?.message}
            value={watch("requirements")}
            onChange={(value) => setValue("requirements", value)}
            placeholder={t(
              "manual_test_case_generation.requirements.placeholder",
            )}
            required
            minRows={6}
          />
          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.feature.label")}
              placeholder={t("manual_test_case_generation.feature.placeholder")}
              error={errors.feature?.message}
              value={watch("feature")}
              onChange={(value) => setValue("feature", value)}
              required
            />
            <FieldText
              className={styles.formGroup}
              label={t("manual_test_case_generation.story.label")}
              placeholder={t("manual_test_case_generation.story.placeholder")}
              inputMode="text"
              error={errors.story?.message}
              value={watch("story")}
              onChange={(value) => setValue("story", value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.owner.label")}
              placeholder={t("manual_test_case_generation.owner.placeholder")}
              error={errors.owner?.message}
              value={watch("owner")}
              onChange={(value) => setValue("owner", value)}
              required
            />
            <FieldText
              className={styles.formGroup}
              inputMode="text"
              label={t("manual_test_case_generation.jira_link.label")}
              placeholder={t(
                "manual_test_case_generation.jira_link.placeholder",
              )}
              error={errors.jira_link?.message}
              value={watch("jira_link")}
              onChange={(value) => setValue("jira_link", value)}
              required
            />
          </div>
          <FieldText
            className={styles.formGroup}
            inputMode="text"
            label={t("manual_test_case_generation.jira_name.label")}
            placeholder={t("manual_test_case_generation.jira_name.placeholder")}
            error={errors.jira_name?.message}
            value={watch("jira_name")}
            onChange={(value) => setValue("jira_name", value)}
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("manual_test_case_generation.btn.label_loading")
                : t("manual_test_case_generation.btn.label")
            }
            disabled={isSubmitting}
            type="submit"
          />
        </form>
      </Card>

      {isSubmitting && (
        <div className={styles.loader}>
          <Spinner size="l" />
        </div>
      )}

      {result && <ManualTestCaseGenerationResult result={result} />}
    </div>
  );
};
