import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Checkbox } from "@snack-uikit/toggles";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import {
  parseTestCases,
  unwrapMarkdownCodeFence,
  ValidateTestCaseRequest,
  ValidateTestCaseResponse,
  ValidateTestCaseSchema,
  wrapInMarkdownCodeFence,
} from "../../utils";
import { ValidationResult } from "./TestCaseValidationResult";
import styles from "./TestCaseValidation.module.scss";

export const TestCaseValidation = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<ValidateTestCaseRequest>({
    resolver: valibotResolver(ValidateTestCaseSchema),
    defaultValues: {
      strict_mode: false,
      test_cases: "",
    },
  });
  const [result, setResult] = useState<ValidateTestCaseResponse | null>(null);
  const { t } = useTranslation();

  const onSubmit = async (request: ValidateTestCaseRequest) => {
    setResult(null);
    try {
      const test_cases = parseTestCases(
        unwrapMarkdownCodeFence(request.test_cases),
      );
      request.test_cases = test_cases as any;
      const response = await apiClient.validateTestCases(request);
      setResult(response);
      toast.success(t("test_case_validation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_validation.result.error"));
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
        {t("test_case_validation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_case_validation.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <MarkdownEditor
            className={styles.formGroup}
            label={t("test_case_validation.test_cases.label")}
            placeholder={t("test_case_validation.test_cases.placeholder")}
            error={errors.test_cases?.message}
            value={watch("test_cases")}
            onChange={(value) =>
              setValue("test_cases", wrapInMarkdownCodeFence(value))
            }
            defaultMode="edit"
            resizable
            required
          />
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <Checkbox
                checked={watch("strict_mode")}
                onChange={(value) => setValue("strict_mode", value)}
                className={styles.checkbox}
              />
              <Typography family="mono" purpose="body" size="m">
                {t("test_case_validation.strict_mode.label")}
              </Typography>
            </label>
          </div>
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("test_case_validation.btn.label_loading")
                : t("test_case_validation.btn.label")
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

      {result && <ValidationResult result={result} />}
    </div>
  );
};
