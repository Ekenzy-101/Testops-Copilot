import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import {
  copyToClipboard,
  GenerateTestPlanRequest,
  GenerateTestPlanResponse,
  GenerateTestPlanSchema,
} from "../../utils";
import styles from "./TestPlanGeneration.module.scss";

export const TestPlanGeneration = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<GenerateTestPlanRequest>({
    resolver: valibotResolver(GenerateTestPlanSchema),
    defaultValues: {
      product: "",
      goals: "",
      scope: "",
      out_of_scope: "",
      risks: "",
      environments: "",
      timelines: "",
    },
  });
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GenerateTestPlanResponse | null>(null);
  const { t, i18n } = useTranslation();

  const onSubmit = async (request: GenerateTestPlanRequest) => {
    setResult(null);
    try {
      const response = await apiClient.generateTestPlan(request);
      setResult(response);
      setCode(response.plan);
      toast.success(t("test_plan_generation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_plan_generation.result.error"));
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
        {t("test_plan_generation.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("test_plan_generation.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FieldText
            inputMode="text"
            label={t("test_plan_generation.product.label")}
            placeholder={t("test_plan_generation.product.placeholder")}
            error={errors.product?.message}
            value={watch("product")}
            onChange={(value) => setValue("product", value)}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.goals.label")}
            placeholder={t("test_plan_generation.goals.placeholder")}
            error={errors.goals?.message}
            value={watch("goals")}
            onChange={(value) => setValue("goals", value)}
            minRows={3}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.scope.label")}
            placeholder={t("test_plan_generation.scope.placeholder")}
            error={errors.scope?.message}
            value={watch("scope")}
            onChange={(value) => setValue("scope", value)}
            minRows={3}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.out_of_scope.label")}
            placeholder={t("test_plan_generation.out_of_scope.placeholder")}
            error={errors.out_of_scope?.message}
            value={watch("out_of_scope")}
            onChange={(value) => setValue("out_of_scope", value)}
            minRows={3}
          />
          <FieldTextArea
            label={t("test_plan_generation.risks.label")}
            placeholder={t("test_plan_generation.risks.placeholder")}
            error={errors.risks?.message}
            value={watch("risks")}
            onChange={(value) => setValue("risks", value)}
            minRows={3}
          />
          <FieldTextArea
            label={t("test_plan_generation.environments.label")}
            placeholder={t("test_plan_generation.environments.placeholder")}
            error={errors.environments?.message}
            value={watch("environments")}
            onChange={(value) => setValue("environments", value)}
            minRows={3}
          />
          <FieldTextArea
            label={t("test_plan_generation.timelines.label")}
            placeholder={t("test_plan_generation.timelines.placeholder")}
            error={errors.timelines?.message}
            value={watch("timelines")}
            onChange={(value) => setValue("timelines", value)}
            minRows={3}
          />
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("test_plan_generation.btn.label_loading")
                : t("test_plan_generation.btn.label")
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

      {result && (
        <div className={styles.result}>
          <Typography family="mono" purpose="title" size="m">
            {t("test_plan_generation.result.title")}
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            {t("test_plan_generation.result.model_used")} {result.model_used}
          </Typography>
          <Typography family="mono" purpose="body" size="s">
            {t("test_plan_generation.result.sections")}{" "}
            {result.sections.join(", ")}
          </Typography>
          <MarkdownEditor
            className={styles.code}
            resizable
            defaultMode="view"
            onChange={setCode}
            value={code}
            onCodeCopyClick={() => copyToClipboard(code, i18n.language)}
          />
        </div>
      )}
    </div>
  );
};
