import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { MarkdownEditor } from "@snack-uikit/markdown";
import { Typography } from "@snack-uikit/typography";
import { apiClient } from "../../services";
import { GenerateTestPlanRequest, GenerateTestPlanResponse } from "../../types";
import { copyToClipboard } from "../../utils";
import styles from "./TestPlanGeneration.module.scss";

export const TestPlanGeneration = () => {
  const [form, setForm] = useState<GenerateTestPlanRequest>({
    product: "",
    goals: [],
    scope: "",
    out_of_scope: "",
    risks: "",
    environments: "",
    timelines: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateTestPlanResponse | null>(null);
  const [code, setCode] = useState("");
  const { t, i18n } = useTranslation();

  const handleChange = (
    field: keyof GenerateTestPlanRequest,
    value: string,
  ) => {
    if (field === "goals") {
      setForm((prev) => ({
        ...prev,
        goals: value.split("\n").filter(Boolean),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await apiClient.generateTestPlan(form);
      setResult(response);
      setCode(response.plan);
      toast.success(t("test_plan_generation.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("test_plan_generation.result.error"));
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldText
            inputMode="text"
            label={t("test_plan_generation.product.label")}
            placeholder={t("test_plan_generation.product.placeholder")}
            value={form.product}
            onChange={(v) => handleChange("product", v)}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.goals.label")}
            placeholder={t("test_plan_generation.goals.placeholder")}
            value={form.goals.join("\n")}
            onChange={(v) => handleChange("goals", v)}
            minRows={3}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.scope.label")}
            placeholder={t("test_plan_generation.scope.placeholder")}
            value={form.scope}
            onChange={(v) => handleChange("scope", v)}
            minRows={3}
            required
          />
          <FieldTextArea
            label={t("test_plan_generation.out_of_scope.label")}
            placeholder={t("test_plan_generation.out_of_scope.placeholder")}
            value={form.out_of_scope}
            onChange={(v) => handleChange("out_of_scope", v)}
            minRows={2}
          />
          <FieldTextArea
            label={t("test_plan_generation.risks.label")}
            placeholder={t("test_plan_generation.risks.placeholder")}
            value={form.risks}
            onChange={(v) => handleChange("risks", v)}
            minRows={2}
          />
          <FieldTextArea
            label={t("test_plan_generation.environments.label")}
            placeholder={t("test_plan_generation.environments.placeholder")}
            value={form.environments}
            onChange={(v) => handleChange("environments", v)}
            minRows={2}
          />
          <FieldTextArea
            label={t("test_plan_generation.timelines.label")}
            placeholder={t("test_plan_generation.timelines.placeholder")}
            value={form.timelines}
            onChange={(v) => handleChange("timelines", v)}
            minRows={2}
          />
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("test_plan_generation.btn.label_loading")
                : t("test_plan_generation.btn.label")
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
