import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import {
  OptimizeTestCaseRequest,
  OptimizeTestCaseResponse,
  OptimizeTestCaseSchema,
  parseTestCases,
  unwrapMarkdownCodeFence,
  wrapInMarkdownCodeFence,
} from "../../utils";
import { TestCaseOptimizationResult } from "./TestCaseOptimizationResult";
import styles from "./TestCaseOptimization.module.scss";

export const TestCaseOptimization = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<OptimizeTestCaseRequest>({
    resolver: valibotResolver(OptimizeTestCaseSchema),
    defaultValues: {
      requirements: "",
      test_cases: "",
    },
  });
  const [result, setResult] = useState<OptimizeTestCaseResponse | null>(null);
  const { t } = useTranslation();

  const onSubmit = async (request: OptimizeTestCaseRequest) => {
    setResult(null);

    try {
      const test_cases = parseTestCases(
        unwrapMarkdownCodeFence(request.test_cases),
      );
      request.test_cases = test_cases as any;
      const response = await apiClient.optimizeTestCases(request);
      setResult(response);
      toast.success(t("test_case_optimization.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_case_optimization.result.error"));
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
        {t("test_case_optimization.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_case_optimization.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FieldTextArea
            className={styles.formGroup}
            label={t("test_case_optimization.requirements.label")}
            placeholder={t("test_case_optimization.requirements.placeholder")}
            error={errors.requirements?.message}
            value={watch("requirements")}
            onChange={(value) => setValue("requirements", value)}
            minRows={6}
            required
          />
          <MarkdownEditor
            className={styles.formGroup}
            label={t("test_case_optimization.test_cases.label")}
            placeholder={t("test_case_optimization.test_cases.placeholder")}
            value={watch("test_cases")}
            onChange={(value) =>
              setValue("test_cases", wrapInMarkdownCodeFence(value))
            }
            defaultMode="edit"
            resizable
            required
          />
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("test_case_optimization.btn.label_loading")
                : t("test_case_optimization.btn.label")
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

      {result && <TestCaseOptimizationResult result={result} />}
    </div>
  );
};
