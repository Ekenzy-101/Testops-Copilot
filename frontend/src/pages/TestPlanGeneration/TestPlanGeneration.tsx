import { useState } from "react";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { FieldText, FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import { GenerateTestPlanRequest, GenerateTestPlanResponse } from "../../types";
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
      const res = await apiClient.generateTestPlan(form);
      setResult(res);
      toast.success("Test plan generated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate plan");
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
        Test Plan Generator
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        Produce a concise, structured test plan from goals, scope, and risks.
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldText
            inputMode="text"
            label="Product"
            value={form.product}
            onChange={(v) => handleChange("product", v)}
            placeholder="Cloud.ru Calculator"
            required
          />
          <FieldTextArea
            label="Goals (one per line)"
            value={form.goals.join("\n")}
            onChange={(v) => handleChange("goals", v)}
            placeholder="Increase coverage\nValidate pricing accuracy"
            minRows={3}
            required
          />
          <FieldTextArea
            label="Scope"
            value={form.scope}
            onChange={(v) => handleChange("scope", v)}
            placeholder="Compute pricing, storage pricing, discounts..."
            minRows={3}
            required
          />
          <FieldTextArea
            label="Out of Scope"
            value={form.out_of_scope}
            onChange={(v) => handleChange("out_of_scope", v)}
            minRows={2}
          />
          <FieldTextArea
            label="Risks"
            value={form.risks}
            onChange={(v) => handleChange("risks", v)}
            minRows={2}
          />
          <FieldTextArea
            label="Environments"
            value={form.environments}
            onChange={(v) => handleChange("environments", v)}
            minRows={2}
          />
          <FieldTextArea
            label="Timelines / Milestones"
            value={form.timelines}
            onChange={(v) => handleChange("timelines", v)}
            minRows={2}
          />
          <ButtonFilled
            className={styles.actions}
            label={loading ? "Generating..." : "Generate Plan"}
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
            Test Plan
          </Typography>
          <Typography
            family="mono"
            purpose="body"
            size="s"
            className={styles.sections}
          >
            Sections: {result.sections.join(", ")}
          </Typography>
          <pre className={styles.plan}>
            <code>{result.plan}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
