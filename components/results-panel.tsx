"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Clock,
  Activity,
  HardDrive,
  Layers,
} from "lucide-react";
import {
  calcTotalVram,
  calcTTFT,
  calcTokensPerSecond,
  calcWeightsVram,
  gpusRequired,
  effectiveBandwidthGBs,
  getActiveParams,
  type GpuSpec,
} from "@/lib/llm-data";
import type { CalcConfig } from "@/components/config-panel";
import { InferenceSimulator } from "@/components/inference-simulator";
import AccuracyChart from "@/components/accuracy-chart";
import { useI18n } from "@/lib/i18n";

interface ResultsPanelProps {
  config: CalcConfig;
}

function fmtGb(n: number) {
  return `${n.toFixed(2)} GB`;
}

type FitStatus = "fits" | "tight" | "overflow";

function getFitStatus(totalVram: number, gpu: GpuSpec, numGpus: number): FitStatus {
  const ratio = totalVram / (gpu.vramGb * numGpus);
  if (ratio <= 0.85) return "fits";
  if (ratio <= 1.0) return "tight";
  return "overflow";
}

const FIT_CONFIG: Record<
  FitStatus,
  { labelKey: string; color: string; icon: React.ElementType; bg: string; bar: string }
> = {
  fits:     { labelKey: "results.fitFits",     color: "text-emerald-400", icon: CheckCircle2,  bg: "bg-emerald-500/10 border-emerald-500/25", bar: "bg-emerald-500" },
  tight:    { labelKey: "results.fitTight",    color: "text-amber-400",   icon: AlertTriangle, bg: "bg-amber-500/10 border-amber-500/25",    bar: "bg-amber-500"   },
  overflow: { labelKey: "results.fitOverflow", color: "text-red-400",     icon: XCircle,       bg: "bg-red-500/10 border-red-500/25",        bar: "bg-red-500"     },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  accent = false,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  sub?: string;
  accent?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border p-4 flex flex-col gap-2 ${
        accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
        {badge}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-mono font-bold ${
            accent ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {sub && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">{sub}</p>
      )}
    </div>
  );
}

function FormulaBlock({
  title,
  formula,
  explanation,
}: {
  title: string;
  formula: string;
  explanation: string;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left group">
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">
        <div className="rounded-md bg-muted/40 border border-border p-3 font-mono text-xs text-primary leading-relaxed mb-2 whitespace-pre-wrap">
          {formula}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{explanation}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ResultsPanel({ config }: ResultsPanelProps) {
  const { t, tn } = useI18n();
  const {
    gpu,
    numGpus,
    model,
    quant,
    kvCache,
    contextLen,
    concurrentUsers,
    promptTokens,
    pagedAttention = false,
    speculativeDecoding = false,
    specDraftModelSize = 0,
    specMode = "standard",
    expertOffloading = false,
    numGpuExperts = 0,
  } = config;

  const vram = useMemo(
    () =>
      calcTotalVram(
        model,
        quant,
        kvCache,
        contextLen,
        concurrentUsers,
        pagedAttention,
        speculativeDecoding,
        specDraftModelSize,
        specMode,
        expertOffloading,
        numGpuExperts
      ),
    [model, quant, kvCache, contextLen, concurrentUsers, pagedAttention, speculativeDecoding, specDraftModelSize, specMode, expertOffloading, numGpuExperts]
  );

  const ttft = useMemo(
    () => calcTTFT(model, quant, gpu, numGpus, promptTokens),
    [model, quant, gpu, numGpus, promptTokens]
  );

  const tps = useMemo(
    () => calcTokensPerSecond(model, quant, gpu, numGpus, concurrentUsers, vram.specMode, vram.offloadPenaltyFactor, vram.totalGb),
    [model, quant, gpu, numGpus, concurrentUsers, vram.specMode, vram.offloadPenaltyFactor, vram.totalGb]
  );

  const totalAvailableVram = gpu.vramGb * numGpus;
  const fitStatus = getFitStatus(vram.totalGb, gpu, numGpus);
  const fitCfg = FIT_CONFIG[fitStatus];
  const FitIcon = fitCfg.icon;
  const usagePercent = Math.min((vram.totalGb / totalAvailableVram) * 100, 100);
  const minGpus = gpusRequired(vram.totalGb, gpu);
  const effectiveBw = effectiveBandwidthGBs(gpu, numGpus);
  const isMoE = vram.isMoE;
  const activeParams = getActiveParams(model);

  const ttftDisplay =
    ttft < 1000 ? `${ttft.toFixed(0)} ms` : `${(ttft / 1000).toFixed(2)} s`;

  const headDim = Math.round(model.hiddenDim / model.numHeads);
  const kvPerUser =
    (2 * model.numKvHeads * headDim * contextLen * model.layers * (kvCache.bitsPerElement / 8)) /
    1024 ** 3;

  // Throughput per user vs total system throughput
  const totalSystemTps = tps * concurrentUsers;

  return (
    <div className="flex flex-col gap-6 p-5 overflow-y-auto h-full">
      {/* ── Fit Status ─────────────────────────────────────── */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 ${fitCfg.bg}`}>
        <FitIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${fitCfg.color}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${fitCfg.color}`}>{t(fitCfg.labelKey)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("results.requiredAvailable", {
              req: fmtGb(vram.totalGb),
              avail: fmtGb(totalAvailableVram),
              n: numGpus,
              gpu: gpu.name,
            })}
          </p>
          {fitStatus === "overflow" && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("results.minGpusNeeded")}{" "}
              <span className="font-mono font-bold text-foreground">{minGpus}×</span>
            </p>
          )}
        </div>
      </div>

      {/* ── VRAM Usage Bar ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("results.vramUtilization")}</span>
          <span className="font-mono font-semibold text-foreground">
            {t("results.vramUtilizationValue", {
              pct: usagePercent.toFixed(1),
              total: fmtGb(totalAvailableVram),
            })}
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fitCfg.bar}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        {/* Stacked breakdown bar */}
        <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary transition-all duration-500"
            style={{ width: `${(vram.weightsGb / vram.totalGb) * 100}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${(vram.kvCacheGb / vram.totalGb) * 100}%` }}
          />
          <div
            className="bg-purple-400 transition-all duration-500"
            style={{ width: `${(vram.activationsGb / vram.totalGb) * 100}%` }}
          />
          {vram.draftModelGb > 0 && (
            <div
              className="bg-cyan-500 transition-all duration-500"
              style={{ width: `${(vram.draftModelGb / vram.totalGb) * 100}%` }}
            />
          )}
          {vram.mtpHeadGb && vram.mtpHeadGb > 0 && (
            <div
              className="bg-cyan-400 transition-all duration-500"
              style={{ width: `${(vram.mtpHeadGb / vram.totalGb) * 100}%` }}
            />
          )}
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-primary inline-block" />
            {t("results.legendWeights")} {fmtGb(vram.weightsGb)}{" "}
            <span className="text-muted-foreground/60">
              ({((vram.weightsGb / vram.totalGb) * 100).toFixed(0)}%)
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
            {t("results.legendKvCache")} {fmtGb(vram.kvCacheGb)}{" "}
            <span className="text-muted-foreground/60">
              ({((vram.kvCacheGb / vram.totalGb) * 100).toFixed(0)}%)
            </span>
            {pagedAttention && <span className="text-emerald-400 ml-0.5">{t("results.pagedSuffix")}</span>}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-purple-400 inline-block" />
            {t("results.legendActivations")} {fmtGb(vram.activationsGb)}{" "}
            <span className="text-muted-foreground/60">
              ({((vram.activationsGb / vram.totalGb) * 100).toFixed(0)}%)
            </span>
          </span>
          {vram.draftModelGb > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block" />
              {t("results.legendDraft")} {fmtGb(vram.draftModelGb)}{" "}
              <span className="text-muted-foreground/60">
                ({((vram.draftModelGb / vram.totalGb) * 100).toFixed(0)}%)
              </span>
            </span>
          )}
          {vram.mtpHeadGb && vram.mtpHeadGb > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-cyan-400 inline-block" />
              {t("results.legendMtp")} {fmtGb(vram.mtpHeadGb)}{" "}
              <span className="text-muted-foreground/60">
                ({((vram.mtpHeadGb / vram.totalGb) * 100).toFixed(0)}%)
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── Primary Metric Cards ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          icon={HardDrive}
          label={t("results.totalVram")}
          value={vram.totalGb.toFixed(1)}
          unit="GB"
          sub={t("results.totalVramSub", {
            quant: quant.label,
            users: tn("common.userCount", concurrentUsers),
          })}
          accent
          badge={
            isMoE ? (
              <Badge
                variant="outline"
                className="text-[9px] border-primary/30 text-primary bg-primary/10"
              >
                MoE
              </Badge>
            ) : undefined
          }
        />
        <MetricCard
          icon={Clock}
          label={t("results.timeToFirstToken")}
          value={ttft < 1000 ? ttft.toFixed(0) : (ttft / 1000).toFixed(2)}
          unit={ttft < 1000 ? "ms" : "s"}
          sub={t("results.ttftSub", {
            prompt: promptTokens,
            n: numGpus,
            params: isMoE
              ? t("results.ttftSubActive", { active: activeParams })
              : t("results.ttftSubParams", { params: model.params }),
          })}
        />
        <MetricCard
          icon={Zap}
          label={t("results.tokensPerSecond")}
          value={tps.toFixed(1)}
          unit="tok/s"
          sub={t("results.tpsSub", {
            total: totalSystemTps.toFixed(0),
            bw: effectiveBw.toFixed(0),
          })}
        />
      </div>

      {/* ── VRAM Overflow Warning ────────────────────────────── */}
      {fitStatus === "overflow" && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-red-400 font-semibold">
              {t("results.overflowTitle", { req: fmtGb(vram.totalGb), avail: fmtGb(totalAvailableVram) })}
            </span>{" "}
            {t("results.overflowBody1")}
            <span className="text-foreground">{t("results.overflowBodyStrong")}</span>
            {t("results.overflowBody2", {
              hbm: effectiveBw.toFixed(0),
              pcie: (effectiveBw * Math.min((totalAvailableVram / vram.totalGb) * 0.3, 0.1)).toFixed(0),
            })}
            {t("results.overflowBody3", { n: numGpus, gpu: gpu.name, max: (gpu.vramGb * numGpus * 0.92).toFixed(0) })}
            <span className="text-foreground font-medium">{t("results.overflowBodyStrong2")}</span>
            {t("results.overflowBody4")}
          </div>
        </div>
      )}

      {/* ── Diffusion Model Notice ───────────────────────────── */}
      {model.modelType === "diffusion" && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-cyan-400 font-semibold">{t("results.diffusionStrong")}</span>
            {t("results.diffusionBody1", { model: model.name })}
            <span className="text-foreground">{t("results.diffusionBodyStrong")}</span>
            {t("results.diffusionBody2", { ttft: Math.round(ttft * 3), tps: tps.toFixed(0) })}
          </div>
        </div>
      )}

      {/* ── MoE explanation callout ─────────────────────────── */}
      {isMoE && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">{t("results.moeStrong")}</span>
            {t("results.moeBody1")}
            <span className="font-mono text-foreground">{t("results.moeTotalParams", { params: model.params })}</span>
            {t("results.moeBody2")}
            <span className="font-mono text-foreground">{t("results.moeActiveParams", { active: activeParams })}</span>
            {t("results.moeBody3", {
              active: model.numExpertsActive,
              total: model.numExperts,
              pct: ((activeParams / model.params) * 100).toFixed(1),
              model: model.name,
            })}
          </div>
        </div>
      )}

      {/* ── Inference Optimizations Note ──────────────────────── */}
      {(pagedAttention || speculativeDecoding || vram.expertOffloading) && (
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">{t("results.optStrong")}</span>
            {pagedAttention && (
              <span>{t("results.optPaged")}</span>
            )}
            {speculativeDecoding && vram.specMode === "standard" && (
              <span>
                {t("results.optSpecStandard1", { size: specDraftModelSize })}
                <span className="font-mono text-foreground">{fmtGb(vram.draftModelGb)}</span>
                {t("results.optSpecStandard2")}
              </span>
            )}
            {speculativeDecoding && vram.specMode === "mtp" && (
              <span>
                {t("results.optSpecMtp1")}
                <span className="font-mono text-foreground">{fmtGb(vram.mtpHeadGb ?? 0.3)}</span>
                {t("results.optSpecMtp2")}
              </span>
            )}
            {vram.expertOffloading && vram.numGpuExperts && (
              <span>
                {t("results.optOffload1", {
                  n: vram.numGpuExperts,
                  total: model.numExperts,
                  full: fmtGb(calcWeightsVram(model, quant)),
                })}
                <span className="font-mono text-foreground">{fmtGb(vram.weightsGb)}</span>
                {t("results.optOffload2")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Detailed Breakdown Table ─────────────────────────── */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {t("results.vramBreakdown")}
          </p>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              label: t("results.bwModelWeights"),
              value: vram.weightsGb,
              sub: t("results.bwWeightsSub", {
                params: model.params,
                bpw: quant.bitsPerWeight,
                overhead: quant.overheadFactor,
                extra: isMoE
                  ? vram.expertOffloading && vram.numGpuExperts
                    ? t("results.bwWeightsMoEOnGpu", { n: vram.numGpuExperts, total: model.numExperts })
                    : t("results.bwWeightsMoEAll", { n: model.numExperts })
                  : "",
              }),
              color: "bg-primary",
            },
            {
              label: t("results.bwKvCache"),
              value: vram.kvCacheGb,
              sub: t("results.bwKvSub", {
                kvHeads: model.numKvHeads,
                headDim,
                ctx: contextLen.toLocaleString(),
                layers: model.layers,
                users: concurrentUsers,
                bytes: kvCache.bitsPerElement / 8,
                paged: pagedAttention ? t("results.bwKvPaged") : "",
              }),
              color: "bg-amber-500",
            },
            {
              label: t("results.bwActivations"),
              value: vram.activationsGb,
              sub: t("results.bwActivationsSub", {
                users: concurrentUsers,
                ctx: contextLen.toLocaleString(),
                hidden: model.hiddenDim,
                extra: isMoE ? t("results.bwActivationsMoE") : "",
              }),
              color: "bg-purple-400",
            },
            ...(speculativeDecoding && vram.specMode === "standard" && vram.draftModelGb > 0
              ? [
                  {
                    label: t("results.bwDraft"),
                    value: vram.draftModelGb,
                    sub: t("results.bwDraftSub", { size: specDraftModelSize, bpw: quant.bitsPerWeight }),
                    color: "bg-cyan-500",
                  },
                ]
              : []),
            ...(speculativeDecoding && vram.specMode === "mtp" && vram.mtpHeadGb
              ? [
                  {
                    label: t("results.bwMtp"),
                    value: vram.mtpHeadGb,
                    sub: t("results.bwMtpSub"),
                    color: "bg-cyan-500",
                  },
                ]
              : []),
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="px-4 py-3 flex items-start gap-3">
              <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 mt-1 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="font-mono text-sm font-bold text-foreground flex-shrink-0">
                    {fmtGb(value)}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 break-all">
                  {sub}
                </p>
              </div>
            </div>
          ))}
          <div className="px-4 py-3 flex items-center justify-between bg-muted/20">
            <p className="text-sm font-bold text-foreground">{t("results.total")}</p>
            <p className="font-mono text-sm font-bold text-primary">{fmtGb(vram.totalGb)}</p>
          </div>
        </div>
      </div>

      {/* ── Multi-GPU note ────────────────────────────────────── */}
      {numGpus > 1 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">
              {t("results.tensorParallelStrong", { n: numGpus })}
            </span>
            {t("results.tensorParallel1", { n: numGpus })}
            {fmtGb(vram.weightsGb / numGpus)}
            {t("results.tensorParallel2")}
            {effectiveBw.toFixed(0)}
            {t("results.tensorParallel3")}
            {gpu.nvlinkBandwidthGBs >= 400
              ? t("results.tensorParallelNvlink")
              : t("results.tensorParallelPcie")}
            {t("results.tensorParallel4", { n: numGpus, tf: gpu.tflops16 })}
            {(gpu.tflops16 * numGpus * 0.8).toFixed(0)}
            {t("results.tensorParallel5")}
          </div>
        </div>
      )}

      {/* ── Per-user KV note for high concurrency ─────────────── */}
      {concurrentUsers > 1 && (
        <div className="rounded-lg border border-border bg-muted/20 p-3 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">
              {t("results.concurrencyStrong", { n: concurrentUsers })}
            </span>
            {t("results.concurrency1", { kvPerUser: kvPerUser.toFixed(3) })}
            {fmtGb(vram.kvCacheGb)}
            {t("results.concurrency2")}
            <span className="font-mono text-foreground font-bold">
              {totalSystemTps.toFixed(0)} tok/s
            </span>
            {t("results.concurrency3", { tps: tps.toFixed(1) })}
          </div>
        </div>
      )}

      <Separator className="bg-border" />

      {/* ── Formula Reference ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {t("results.formulaReference")}
        </p>
        <div className="divide-y divide-border rounded-lg border border-border bg-card overflow-hidden px-4">
          <FormulaBlock
            title={t("results.fWeightsTitle")}
            formula={[
              t("results.fWeightsFormula1"),
              ``,
              isMoE ? t("results.fWeightsMoe", { n: model.numExperts }) : ``,
              t("results.fWeightsExample", {
                params: model.params,
                bpw: (quant.bitsPerWeight / 8).toFixed(4),
                overhead: quant.overheadFactor,
              }),
              t("results.fWeightsResult", { gb: vram.weightsGb.toFixed(3) }),
            ]
              .filter(Boolean)
              .join("\n")}
            explanation={
              isMoE
                ? t("results.fWeightsExplMoE", {
                    active: model.numExpertsActive,
                    total: model.numExperts,
                  })
                : t("results.fWeightsExplDense")
            }
          />
          <FormulaBlock
            title={t("results.fKvTitle")}
            formula={[
              t("results.fKvFormula1"),
              ``,
              t("results.fKvHeadDim", {
                hidden: model.hiddenDim,
                heads: model.numHeads,
                headDim,
              }),
              ``,
              isMoE ? t("results.fKvMoe") : ``,
              t("results.fKvExample", {
                kvHeads: model.numKvHeads,
                headDim,
                ctx: contextLen.toLocaleString(),
                layers: model.layers,
                users: concurrentUsers,
                bytes: kvCache.bitsPerElement / 8,
              }),
              t("results.fKvResult", { gb: vram.kvCacheGb.toFixed(4) }),
            ]
              .filter(Boolean)
              .join("\n")}
            explanation={t("results.fKvExpl", {
              kvHeads: model.numKvHeads,
              heads: model.numHeads,
              factor: (model.numHeads / model.numKvHeads).toFixed(0),
            })}
          />
          <FormulaBlock
            title={isMoE ? t("results.fTtftTitleMoE") : t("results.fTtftTitle")}
            formula={[
              isMoE
                ? t("results.fTtftMoe", { active: activeParams, total: model.params })
                : ``,
              t("results.fTtftFormula", {
                p: isMoE ? t("results.fTtftActive") : t("results.fTtftParams"),
              }),
              ``,
              t("results.fTtftPrefill", {
                active: activeParams,
                prompt: promptTokens,
                gflop: ((2 * activeParams * promptTokens) / 1e3).toFixed(1),
              }),
              t("results.fTtftEff", {
                tf: gpu.tflops16,
                n: numGpus,
                tpEff: numGpus > 1 ? "0.80" : "1.0",
                quantEff: quant.bitsPerWeight >= 8 ? "1.0" : "0.85",
                eff: (gpu.tflops16 * numGpus * (numGpus > 1 ? 0.8 : 1) * (quant.bitsPerWeight >= 8 ? 1 : 0.85)).toFixed(1),
              }),
              t("results.fTtftResult", {
                s: ((2 * activeParams * 1e9 * promptTokens) / (gpu.tflops16 * numGpus * (numGpus > 1 ? 0.8 : 1) * (quant.bitsPerWeight >= 8 ? 1 : 0.85) * 1e12)).toFixed(4),
                display: ttftDisplay,
              }),
            ]
              .filter(Boolean)
              .join("\n")}
            explanation={
              isMoE
                ? t("results.fTtftExplMoE", {
                    active: activeParams,
                    total: model.params,
                    nActive: model.numExpertsActive,
                    nTotal: model.numExperts,
                    model: model.name,
                  })
                : t("results.fTtftExplDense")
            }
          />
          <FormulaBlock
            title={isMoE ? t("results.fTpsTitleMoE") : t("results.fTpsTitle")}
            formula={[
              isMoE
                ? t("results.fTpsMoe", { active: activeParams })
                : ``,
              t("results.fTpsFormula", {
                p: isMoE ? t("results.fTpsActive") : t("results.fTpsParams"),
              }),
              ``,
              t("results.fTpsEffBw", { bw: effectiveBw.toFixed(0) }),
              t("results.fTpsBytes", {
                active: activeParams,
                bpw: (quant.bitsPerWeight / 8).toFixed(4),
                n: numGpus,
                gb: ((activeParams * 1e9 * (quant.bitsPerWeight / 8)) / numGpus / 1e9).toFixed(3),
              }),
              t("results.fTpsRaw", {
                raw: (effectiveBw / ((activeParams * 1e9 * (quant.bitsPerWeight / 8)) / numGpus / 1e9)).toFixed(1),
              }),
              t("results.fTpsPerUser", { tps: tps.toFixed(1) }),
            ]
              .filter(Boolean)
              .join("\n")}
            explanation={
              isMoE
                ? t("results.fTpsExplMoE", {
                    active: activeParams,
                    nActive: model.numExpertsActive,
                    total: model.params,
                  })
                : t("results.fTpsExplDense")
            }
          />
        </div>
      </div>

      {/* ── Inference Simulation ─────────────────────────────── */}
      <InferenceSimulator
        ttftMs={ttft}
        tokensPerSecond={tps}
        concurrentUsers={concurrentUsers}
        modelName={model.name}
        promptTokens={promptTokens}
      />

      {/* ── Quantization Accuracy Chart ────────────────────────── */}
      <AccuracyChart config={config} />

      {/* ── Sensitivity ────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t("results.keySensitivities")}
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              label: t("results.sensContextLabel"),
              impact: t("results.sensContextImpact", {
                total: (vram.kvCacheGb * 2).toFixed(2),
                delta: vram.kvCacheGb.toFixed(2),
              }),
              severity: vram.kvCacheGb > vram.weightsGb * 0.3 ? "high" : "low",
            },
            {
              label: t("results.sensUsersLabel"),
              impact: t("results.sensUsersImpact", {
                total: ((vram.kvCacheGb + vram.activationsGb) * 2).toFixed(2),
              }),
              severity: "medium",
            },
            {
              label: t("results.sensQuantLabel"),
              impact: t("results.sensQuantImpact", {
                saved: fmtGb(vram.weightsGb * (1 - 4.5 / 16)),
              }),
              severity: "low",
            },
            ...(isMoE
              ? [
                  {
                    label: t("results.sensMoeLabel"),
                    impact: t("results.sensMoeImpact", {
                      factor: (model.params / activeParams).toFixed(1),
                      active: activeParams,
                    }),
                    severity: "medium" as const,
                  },
                ]
              : []),
          ].map(({ label, impact, severity }) => (
            <div key={label} className="flex items-start gap-2 text-xs">
              <Badge
                variant="outline"
                className={`flex-shrink-0 text-[10px] font-mono ${
                  severity === "high"
                    ? "border-red-500/30 text-red-400 bg-red-500/5"
                    : severity === "medium"
                    ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
                    : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                }`}
              >
                {label}
              </Badge>
              <span className="text-muted-foreground leading-relaxed">{impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}