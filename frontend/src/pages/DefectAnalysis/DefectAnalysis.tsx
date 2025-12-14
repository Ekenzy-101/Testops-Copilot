import { valibotResolver } from "@hookform/resolvers/valibot";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  AnalyzeDefectSchema,
  parseDefects,
} from "../../utils";
import styles from "./DefectAnalysis.module.scss";

export const DefectAnalysis = () => {
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<AnalyzeDefectRequest>({
    resolver: valibotResolver(AnalyzeDefectSchema),
    defaultValues: {
      defects: "",
      requirements: "",
    },
  });
  const [result, setResult] = useState<AnalyzeDefectResponse | null>(null);
  const { t } = useTranslation();

  const onSubmit = async (request: AnalyzeDefectRequest) => {
    setResult(null);

    try {
      request.defects = parseDefects(request.defects) as any;
      if (!request.defects.length) {
        toast.error(t("defect_analysis.client.error"));
        return;
      }
      const response = await apiClient.analyzeDefects(request);
      setResult(response);
      toast.success(t("defect_analysis.result.success"));
    } catch (err: any) {
      toast.error(err?.message || t("defect_analysis.result.error"));
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
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FieldTextArea
            label={t("defect_analysis.input.label")}
            error={errors.defects?.message}
            value={watch("defects")}
            onChange={(value) => setValue("defects", value)}
            placeholder={t("defect_analysis.input.placeholder")}
            minRows={6}
            required
          />
          <FieldTextArea
            label={t("defect_analysis.requirements.label")}
            error={errors.requirements?.message}
            value={watch("requirements")}
            onChange={(value) => setValue("requirements", value)}
            minRows={3}
          />
          <ButtonFilled
            className={styles.actions}
            label={
              isSubmitting
                ? t("defect_analysis.btn.label_loading")
                : t("defect_analysis.btn.label")
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
