import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const defects = parseDefects(defectsInput);
      if (!defects.length) {
        toast.error("Provide at least one defect line");
        setLoading(false);
        return;
      }
      const payload: AnalyzeDefectRequest = {
        defects,
        requirements: requirements || undefined,
      };
      const res = await apiClient.analyzeDefects(payload);
      setResult(res);
      toast.success("Analysis complete");
    } catch (err: any) {
      toast.error(err?.message || "Failed to analyze defects");
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
        Analyze Historical Defects
      </Typography>
      <Typography family="mono" purpose="body" size="m">
        Identify hotspots and recommendations from historical defects.
      </Typography>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldTextArea
            label="Defects (one per line: id|title|severity|area|tags)"
            value={defectsInput}
            onChange={setDefectsInput}
            placeholder="D-101|Null pointer on pricing|High|Pricing|regression,backend"
            minRows={6}
            required
          />
          <FieldTextArea
            label="Current requirements (optional)"
            value={requirements}
            onChange={setRequirements}
            minRows={3}
          />
          <ButtonFilled
            className={styles.actions}
            label={loading ? "Analyzing..." : "Analyze Defects"}
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
            Hotspots
          </Typography>
          <div className={styles.hotspots}>
            {result.hotspots.map((hs, idx) => (
              <div key={idx} className={styles.hotspot}>
                <Typography family="mono" purpose="body" size="m">
                  {hs.area} — {hs.priority}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  Risk: {hs.risk}
                </Typography>
                <Typography family="mono" purpose="body" size="s">
                  Recommendation: {hs.recommendation}
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
