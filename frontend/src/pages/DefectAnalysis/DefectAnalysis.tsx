import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ButtonFilled } from "@snack-uikit/button";
import { Card } from "@snack-uikit/card";
import { Typography } from "@snack-uikit/typography";
import { FieldTextArea } from "@snack-uikit/fields";
import { Spinner } from "@snack-uikit/loaders";
import { apiClient } from "../../services";
import {
  AnalyzeDefectRequest,
  AnalyzeDefectResponse,
  DefectRecord,
} from "../../types";
import styles from "./DefectAnalysis.module.scss";

const parseDefects = (value: string): DefectRecord[] => {
  // Expected per-line: id|title|severity|area|tags(comma)
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, title, severity, area, tags] = line
        .split("|")
        .map((p) => p?.trim());
      return {
        id: id || undefined,
        title: title || "",
        severity: severity || undefined,
        area: area || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      };
    })
    .filter((d) => d.title);
};

export const DefectAnalysis = () => {
  const [defectsInput, setDefectsInput] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeDefectResponse | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const defects = parseDefects(defectsInput);
      if (!defects.length) {
        toast.error(t("defect_analysis.client.error"));
        setLoading(false);
        return;
      }
      const payload: AnalyzeDefectRequest = {
        defects,
        requirements: requirements || undefined,
      };
      const res = await apiClient.analyzeDefects(payload);
      setResult(res);
      toast.success(t("defect_analysis.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("defect_analysis.result.error"));
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
        {t("defect_analysis.title")}
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        {t("defect_analysis.subtitle")}
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            label={t("defect_analysis.input.label")}
            value={defectsInput}
            onChange={setDefectsInput}
            placeholder={t("defect_analysis.input.placeholder")}
            minRows={6}
            required
          />
          <FieldTextArea
            label={t("defect_analysis.requirements.label")}
            value={requirements}
            onChange={setRequirements}
            minRows={3}
          />
          <ButtonFilled
            className={styles.actions}
            label={
              loading
                ? t("defect_analysis.btn.label_loading")
                : t("defect_analysis.btn.label")
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
            {t("defect_analysis.result.title")}
          </Typography>
          <div className={styles.hotspots}>
            {result.hotspots.map((hs, idx) => (
              <div key={idx} className={styles.hotspot}>
                <Typography family="mono" purpose="body" size="m">
                  {hs.area} — {hs.priority}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  {t("defect_analysis.result.hotspots.risk")} {hs.risk}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  {t("defect_analysis.result.hotspots.recommendation")}{" "}
                  {hs.recommendation}
                </Typography>
              </div>
            ))}
          </div>
          <Typography
            family="mono"
            purpose="body"
            size="s"
            className={styles.summary}
          >
            {result.summary}
          </Typography>
        </div>
      )}
    </div>
  );
};
