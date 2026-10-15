"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchableSelect, type SearchableOption } from "@/components/searchable-select";
import { SliderWithInput } from "@/components/slider-with-input";
import {
  GPU_LIST,
  GPU_PROVIDERS,
  MODEL_LIST,
  MODEL_FAMILIES,
  QUANT_OPTIONS,
  KV_CACHE_OPTIONS,
  supportsMtp,
  type GpuSpec,
  type ModelSpec,
  type QuantConfig,
  type KvCacheConfig,
  type ModelSource,
} from "@/lib/llm-data";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { Info, Cpu, Database, Settings2, LayoutGrid, Layers, Zap } from "lucide-react";

export interface CalcConfig {
  gpu: GpuSpec;
  numGpus: number;
  model: ModelSpec;
  quant: QuantConfig;
  kvCache: KvCacheConfig;
  contextLen: number;
  concurrentUsers: number;
  promptTokens: number;
  // Advanced inference options
  pagedAttention: boolean;
  speculativeDecoding: boolean;
  specMode: "standard" | "mtp";
  specDraftModelSize: number;
  specNumDraftTokens: number;
  // Expert offloading (MoE only)
  expertOffloading: boolean;
  numGpuExperts: number;
}

interface ConfigPanelProps {
  config: CalcConfig;
  onChange: (config: CalcConfig) => void;
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help flex-shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs text-xs leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

const SOURCE_LABELS: Record<ModelSource, string> = {
  huggingface: "HF",
  ollama: "Ollama",
  both: "HF + Ollama",
};

const SOURCE_COLORS: Record<ModelSource, string> = {
  huggingface: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ollama: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  both: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function SourceBadge({ source }: { source: ModelSource }) {
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded border font-medium ${SOURCE_COLORS[source]}`}>
      {SOURCE_LABELS[source]}
    </span>
  );
}

function formatContext(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return `${v}`;
}

function formatUsers(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`;
}

const NUM_GPUS_OPTIONS = [1, 2, 4, 8, 16, 32, 64];

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  const { t, tn } = useI18n();
  const [gpuProvider, setGpuProvider] = useState(config.gpu.provider);
  const [modelFamily, setModelFamily] = useState("all");
  const [modelSource, setModelSource] = useState<"all" | ModelSource>("all");

  const update = (partial: Partial<CalcConfig>) => onChange({ ...config, ...partial });

  // ── GPU options ───────────────────────────────────────────────────────────
  const providerOptions: SearchableOption[] = useMemo(
    () => GPU_PROVIDERS.map((p) => ({ value: p, label: p })),
    []
  );

  const filteredGpus = useMemo(
    () => GPU_LIST.filter((g) => g.provider === gpuProvider),
    [gpuProvider]
  );

  const gpuOptions: SearchableOption[] = useMemo(
    () =>
      filteredGpus.map((g) => ({
        value: g.id,
        label: g.name,
        sublabel: t("config.gpuVramSub", {
          vram: g.vramGb,
          bw: g.memoryBandwidthGBs,
          tf: g.tflops16,
        }),
      })),
    [filteredGpus, t]
  );

  const numGpusOptions: SearchableOption[] = NUM_GPUS_OPTIONS.map((n) => ({
    value: String(n),
    label: tn("common.gpuCount", n),
    sublabel: t("config.totalVramSub", { gb: (config.gpu.vramGb * n).toFixed(0) }),
  }));

  // ── Model options ─────────────────────────────────────────────────────────
  const filteredModels = useMemo(() => {
    return MODEL_LIST.filter((m) => {
      const familyOk = modelFamily === "all" || m.family === modelFamily;
      const sourceOk =
        modelSource === "all" || m.source === modelSource || m.source === "both";
      return familyOk && sourceOk;
    });
  }, [modelFamily, modelSource]);

  const modelFamilyOptions: SearchableOption[] = useMemo(
    () => [
      { value: "all", label: t("config.allFamilies") },
      ...MODEL_FAMILIES.map((f) => ({ value: f, label: f })),
    ],
    [t]
  );

  const modelSourceOptions: SearchableOption[] = [
    { value: "all", label: t("config.allSources") },
    { value: "huggingface", label: "Hugging Face" },
    { value: "ollama", label: "Ollama" },
  ];

  const modelOptions: SearchableOption[] = useMemo(
    () =>
      filteredModels.map((m) => {
        const isMoE = Boolean(m.numExperts);
        return {
          value: m.id,
          label: m.name,
          sublabel: isMoE
            ? t("config.modelMoeSub", {
                params: m.params,
                active: m.activeParams,
                experts: `${m.numExpertsActive}/${m.numExperts}`,
              })
            : t("config.modelDenseSub", {
                params: m.params,
                layers: m.layers,
                kv: m.numKvHeads,
              }),
          badge: <SourceBadge source={m.source} />,
        };
      }),
    [filteredModels, t]
  );

  const quantOptions: SearchableOption[] = QUANT_OPTIONS.map((q) => ({
    value: q.id,
    label: q.label,
    sublabel: `${q.bitsPerWeight} bpw — ${t(`quant.${q.id}.qualityNote`, undefined, q.qualityNote)}`,
  }));

  const kvCacheOptions: SearchableOption[] = KV_CACHE_OPTIONS.map((k) => ({
    value: k.id,
    label: k.label,
    sublabel: `${k.bitsPerElement} bit — ${t(`kv.${k.id}.qualityNote`, undefined, k.qualityNote)}`,
  }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleProviderChange = (p: string) => {
    setGpuProvider(p);
    const gpus = GPU_LIST.filter((g) => g.provider === p);
    if (gpus.length > 0 && !gpus.find((g) => g.id === config.gpu.id)) {
      update({ gpu: gpus[0] });
    }
  };

  const handleFamilyChange = (f: string) => {
    setModelFamily(f);
    const models = MODEL_LIST.filter((m) => {
      const familyOk = f === "all" || m.family === f;
      const sourceOk =
        modelSource === "all" || m.source === modelSource || m.source === "both";
      return familyOk && sourceOk;
    });
    if (models.length > 0 && !models.find((m) => m.id === config.model.id)) {
      update({ model: models[0] });
    }
  };

  const handleSourceChange = (s: "all" | ModelSource) => {
    setModelSource(s);
    const models = MODEL_LIST.filter((m) => {
      const familyOk = modelFamily === "all" || m.family === modelFamily;
      const sourceOk = s === "all" || m.source === s || m.source === "both";
      return familyOk && sourceOk;
    });
    if (models.length > 0 && !models.find((m) => m.id === config.model.id)) {
      update({ model: models[0] });
    }
  };

  const isMoE = Boolean(config.model.numExperts);
  const maxCtx = Math.min(config.model.maxContextTokens, 2097152); // 2M cap for UI

  return (
    <div className="flex flex-col gap-6 p-5 h-full overflow-y-auto">
      {/* ── GPU Configuration ─────────────────────────────── */}
      <section>
        <SectionHeader icon={Cpu} title={t("config.sectionGpu")} />
        <div className="flex flex-col gap-3">

          {/* Provider */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{t("config.provider")}</Label>
            <SearchableSelect
              options={providerOptions}
              value={gpuProvider}
              onValueChange={handleProviderChange}
              searchPlaceholder={t("config.searchProvider")}
            />
          </div>

          {/* GPU Model */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.gpuModel")}</Label>
              <InfoTooltip text={t("config.tip.gpuModel")} />
            </div>
            <SearchableSelect
              options={gpuOptions}
              value={config.gpu.id}
              onValueChange={(id) => {
                const gpu = GPU_LIST.find((g) => g.id === id)!;
                update({ gpu });
              }}
              searchPlaceholder={t("config.searchGpus")}
              maxHeight={300}
            />
          </div>

          {/* GPU specs */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              { label: t("config.vram"), value: `${config.gpu.vramGb} GB` },
              { label: t("config.memBw"), value: `${config.gpu.memoryBandwidthGBs} GB/s` },
              { label: t("config.fp16Tf"), value: `${config.gpu.tflops16} TF` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-md bg-muted/50 border border-border p-2">
                <p className="text-[10px] text-muted-foreground leading-none mb-1">{label}</p>
                <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* Number of GPUs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.numGpus")}</Label>
              <InfoTooltip text={t("config.tip.numGpus")} />
            </div>
            <SearchableSelect
              options={numGpusOptions}
              value={String(config.numGpus)}
              onValueChange={(v) => update({ numGpus: Number(v) })}
              searchPlaceholder={t("config.selectGpuCount")}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* ── Model Configuration ───────────────────────────── */}
      <section>
        <SectionHeader icon={LayoutGrid} title={t("config.sectionModel")} />
        <div className="flex flex-col gap-3">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.source")}</Label>
              <SearchableSelect
                options={modelSourceOptions}
                value={modelSource}
                onValueChange={(v) => handleSourceChange(v as "all" | ModelSource)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.family")}</Label>
              <SearchableSelect
                options={modelFamilyOptions}
                value={modelFamily}
                onValueChange={handleFamilyChange}
                searchPlaceholder={t("config.searchFamily")}
              />
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("config.model")}{" "}
              <span className="text-muted-foreground/60 font-normal">
                {t("config.availableModels", { n: filteredModels.length })}
              </span>
            </Label>
            <SearchableSelect
              options={modelOptions}
              value={config.model.id}
              onValueChange={(id) => {
                const model = MODEL_LIST.find((m) => m.id === id)!;
                update({ model, contextLen: Math.min(config.contextLen, model.maxContextTokens) });
              }}
              searchPlaceholder={t("config.typeModelName")}
              maxHeight={360}
            />
          </div>

          {/* Model specs */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              {
                label: isMoE ? t("config.totalParams") : t("config.params"),
                value: `${config.model.params}B`,
              },
              {
                label: isMoE ? t("config.activeParams") : t("config.layers"),
                value: isMoE
                  ? `${config.model.activeParams}B`
                  : `${config.model.layers}`,
              },
              {
                label: t("config.kvHeads"),
                value: `${config.model.numKvHeads}`,
              },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-md bg-muted/50 border border-border p-2">
                <p className="text-[10px] text-muted-foreground leading-none mb-1">{label}</p>
                <p className="text-xs font-mono font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* MoE badge */}
          {isMoE && (
            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 flex items-start gap-2">
              <Layers className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">{t("config.moeLabel")}</span>{" "}
                {t("config.moeDesc", {
                  active: config.model.numExpertsActive,
                  total: config.model.numExperts,
                  params: config.model.params,
                  activeParams: config.model.activeParams,
                })}
                {config.model.notes &&
                  ` ${t(`modelNotes.${config.model.id}`, undefined, config.model.notes)}.`}
              </p>
            </div>
          )}
        </div>
      </section>

      <Separator className="bg-border" />

      {/* ── Quantization & KV ─────────────────────────────── */}
      <section>
        <SectionHeader icon={Database} title={t("config.sectionPrecision")} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.weightQuant")}</Label>
              <InfoTooltip text={t("config.tip.weightQuant")} />
            </div>
            <SearchableSelect
              options={quantOptions}
              value={config.quant.id}
              onValueChange={(id) => {
                const quant = QUANT_OPTIONS.find((q) => q.id === id)!;
                update({ quant });
              }}
              searchPlaceholder={t("config.searchQuant")}
              maxHeight={300}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.kvPrecision")}</Label>
              <InfoTooltip text={t("config.tip.kvPrecision")} />
            </div>
            <SearchableSelect
              options={kvCacheOptions}
              value={config.kvCache.id}
              onValueChange={(id) => {
                const kvCache = KV_CACHE_OPTIONS.find((k) => k.id === id)!;
                update({ kvCache });
              }}
              searchPlaceholder={t("config.searchKv")}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* ── Context & Concurrency ─────────────────────────── */}
      <section>
        <SectionHeader icon={Settings2} title={t("config.sectionContext")} />
        <div className="flex flex-col gap-5">

          {/* Context length */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.contextWindow")}</Label>
              <InfoTooltip text={t("config.tip.contextWindow")} />
            </div>
            <SliderWithInput
              min={512}
              max={maxCtx}
              step={512}
              value={config.contextLen}
              onValueChange={(v) => update({ contextLen: v })}
              format={formatContext}
              unit="tok"
              markers={[512, Math.floor(maxCtx * 0.25), Math.floor(maxCtx * 0.5), maxCtx]}
            />
            <p className="text-[10px] text-muted-foreground">
              {t("config.maxFor", { model: config.model.name, ctx: formatContext(config.model.maxContextTokens) })}
            </p>
          </div>

          {/* Prompt tokens */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.promptLength")}</Label>
              <InfoTooltip text={t("config.tip.promptLength")} />
            </div>
            <SliderWithInput
              min={1}
              max={Math.min(config.contextLen, 65536)}
              step={1}
              value={config.promptTokens}
              onValueChange={(v) => update({ promptTokens: v })}
              format={formatContext}
              unit="tok"
              markers={[1, 512, 2048, 8192]}
            />
          </div>

          {/* Concurrent users */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">{t("config.concurrentUsers")}</Label>
              <InfoTooltip text={t("config.tip.concurrentUsers")} />
            </div>
            <SliderWithInput
              min={1}
              max={4096}
              step={1}
              value={config.concurrentUsers}
              onValueChange={(v) => update({ concurrentUsers: v })}
              format={formatUsers}
              unit={t("config.unitUsers")}
              markers={[1, 32, 256, 1024, 4096]}
            />
            {config.concurrentUsers > 64 && (
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1.5">
                <p className="text-[10px] text-amber-400 leading-relaxed">
                  {t("config.highConcurrency", {
                    gb: (
                      (2 * config.model.numKvHeads * (config.model.hiddenDim / config.model.numHeads) * config.contextLen * config.model.layers * (config.kvCache.bitsPerElement / 8)) /
                      1024 ** 3
                    ).toFixed(2),
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
  </section>

      <Separator className="bg-border" />

      {/* ── Advanced Inference Options ────────────────────────── */}
      <section>
        <SectionHeader icon={Zap} title={t("config.sectionInference")} />
        <div className="flex flex-col gap-4">

          {/* Paged Attention */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Label className="text-xs text-muted-foreground">{t("config.pagedAttention")}</Label>
                <InfoTooltip text={t("config.tip.pagedAttention")} />
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                {t("config.pagedAttentionDesc")}
              </p>
            </div>
            <Switch
              checked={config.pagedAttention}
              onCheckedChange={(v) => update({ pagedAttention: v })}
            />
          </div>

          {/* Speculative Decoding */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Label className="text-xs text-muted-foreground">{t("config.specDecoding")}</Label>
                <InfoTooltip text={t("config.tip.specDecoding")} />
              </div>
              <p className="text-[10px] text-muted-foreground/70">
                {t("config.specDecodingDesc")}
              </p>
            </div>
            <Switch
              checked={config.speculativeDecoding}
              onCheckedChange={(v) => update({ speculativeDecoding: v })}
            />
          </div>

          {/* Speculative Decoding Options (shown when enabled) */}
          {config.speculativeDecoding && (
            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-3">
              {/* Mode selection: Standard vs MTP */}
              {supportsMtp(config.model) && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      config.specMode === "standard"
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-muted/40 text-muted-foreground border border-border hover:bg-muted"
                    }`}
                    onClick={() => update({ specMode: "standard" })}
                  >
                    {t("config.standard")}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      config.specMode === "mtp"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "bg-muted/40 text-muted-foreground border border-border hover:bg-muted"
                    }`}
                    onClick={() => update({ specMode: "mtp" })}
                  >
                    {t("config.mtpMode")}
                  </button>
                </div>
              )}

              {config.specMode === "standard" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground">{t("config.draftModelSize")}</Label>
                      <InfoTooltip text={t("config.tip.draftModelSize")} />
                    </div>
                    <SliderWithInput
                      min={0.1}
                      max={3}
                      step={0.1}
                      value={config.specDraftModelSize}
                      onValueChange={(v) => update({ specDraftModelSize: v })}
                      format={(v) => `${v.toFixed(1)}B`}
                      unit=""
                      markers={[0.5, 1, 1.5, 2]}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground">{t("config.draftTokens")}</Label>
                      <InfoTooltip text={t("config.tip.draftTokens")} />
                    </div>
                    <SliderWithInput
                      min={2}
                      max={16}
                      step={1}
                      value={config.specNumDraftTokens}
                      onValueChange={(v) => update({ specNumDraftTokens: v })}
                      format={(v) => `${v}`}
                      unit={t("config.unitTokens")}
                      markers={[2, 4, 8, 12, 16]}
                    />
                  </div>
                  <p className="text-[10px] text-primary/80 leading-relaxed">
                    {t("config.specResult", {
                      gb: ((config.specDraftModelSize * 1e9 * (config.quant.bitsPerWeight / 8)) / 1024 ** 3).toFixed(2),
                      speedup: (1 + (config.specNumDraftTokens * 0.6) / 2).toFixed(1),
                    })}
                  </p>
                </>
              )}

              {config.specMode === "mtp" && (
                <div className="space-y-2">
                  <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                    <p className="text-[10px] text-cyan-400 leading-relaxed">
                      <span className="font-semibold">{t("config.mtpNoteStrong")}</span>
                      {t("config.mtpNote")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expert Offloading (MoE only) */}
          {isMoE && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label className="text-xs text-muted-foreground">{t("config.expertOffloading")}</Label>
                    <InfoTooltip text={t("config.tip.expertOffloading")} />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {t("config.expertOffloadingDesc")}
                  </p>
                </div>
                <Switch
                  checked={config.expertOffloading}
                  onCheckedChange={(v) => update({ expertOffloading: v })}
                />
              </div>

              {config.expertOffloading && (
                <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-3 space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground">{t("config.expertsOnGpu")}</Label>
                      <InfoTooltip text={t("config.tip.expertsOnGpu")} />
                    </div>
                    <SliderWithInput
                      min={Math.min(config.model.numExpertsActive ?? 1, config.model.numExperts ?? 1)}
                      max={config.model.numExperts ?? 8}
                      step={1}
                      value={config.numGpuExperts}
                      onValueChange={(v) => update({ numGpuExperts: v })}
                      format={(v) => `${v} / ${config.model.numExperts}`}
                      unit=""
                      markers={[config.model.numExpertsActive ?? 1, config.model.numExperts ?? 8]}
                    />
                  </div>

                  {/* Recommended expert count suggestion */}
                  {(() => {
                    const totalExperts = config.model.numExperts ?? 1;
                    const activeExperts = config.model.numExpertsActive ?? 1;
                    const recommendedMin = Math.max(activeExperts, Math.ceil(totalExperts * 0.15));
                    const recommendedMax = Math.min(totalExperts, Math.ceil(totalExperts * 0.4));
                    const expertWeightFrac = 0.7;
                    const fullWeightsVram = (config.model.params * 1e9 * (config.quant.bitsPerWeight / 8) * config.quant.overheadFactor) / 1024 ** 3;
                    const offloadedFrac = 1 - config.numGpuExperts / totalExperts;
                    const savedVram = fullWeightsVram * offloadedFrac * expertWeightFrac;

                    return (
                      <>
                        {/* Suggestion box */}
                        {config.numGpuExperts < recommendedMin && (
                          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-2">
                            <p className="text-[10px] text-amber-400 leading-relaxed">
                              <span className="font-semibold">{t("config.suggestionStrong")}</span>
                              {t("config.suggestionKeep")}
                              <span className="font-mono font-bold">
                                {t("config.suggestionExperts", { n: recommendedMin })}
                              </span>
                              {t("config.suggestionOnGpu")}
                              {activeExperts > 1 && (
                                <span>{t("config.suggestionActiveMulti", { active: activeExperts })}</span>
                              )}
                              {activeExperts === 1 && (
                                <span>{t("config.suggestionActiveOne")}</span>
                              )}
                            </p>
                          </div>
                        )}

                        {/* VRAM savings display */}
                        {config.numGpuExperts < totalExperts && (
                          <div className="rounded-md border border-purple-500/20 bg-purple-500/5 px-2.5 py-2">
                            <p className="text-[10px] text-purple-300 leading-relaxed">
                              <span className="font-semibold">{t("config.vramSavedStrong")}</span>
                              {t("config.vramSaved", { gb: savedVram.toFixed(2) })}
                              <span className="text-muted-foreground ml-1">
                                {t("config.offloadedExperts", {
                                  offloaded: totalExperts - config.numGpuExperts,
                                  total: totalExperts,
                                })}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Optimal range indicator */}
                        {config.numGpuExperts >= recommendedMin && config.numGpuExperts <= recommendedMax && (
                          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-2">
                            <p className="text-[10px] text-emerald-400 leading-relaxed">
                              <span className="font-semibold">{t("config.recommendedRangeStrong")}</span>
                              {t("config.recommendedRange", { min: recommendedMin, max: recommendedMax })}
                              <span className="text-muted-foreground ml-1">
                                {t("config.keepingPct", { pct: ((config.numGpuExperts / totalExperts) * 100).toFixed(0) })}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Explanation tooltip */}
                        <div className="rounded-md border border-border bg-muted/20 px-2.5 py-2">
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">{t("config.whyMattersStrong")}</span>
                            {t("config.whyMatters", {
                              active: activeExperts,
                              total: totalExperts,
                              gb: savedVram.toFixed(1),
                            })}
                            {config.numGpuExperts < activeExperts && (
                              <span className="text-red-400 ml-1 font-semibold">
                                {t("config.warningThrashing", { active: activeExperts })}
                              </span>
                            )}
                          </p>
                        </div>
                      </>
                    );
                  })()}

                  {config.numGpuExperts < (config.model.numExpertsActive ?? 1) && (
                    <div className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1.5">
                      <p className="text-[10px] text-red-400 leading-relaxed">
                        {t("config.critical", { active: config.model.numExpertsActive })}
                      </p>
                    </div>
                  )}
                  {config.numGpuExperts >= (config.model.numExperts ?? 1) && (
                    <p className="text-[10px] text-purple-300 leading-relaxed">
                      {t("config.allExpertsOnGpu")}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Paged Attention info */}
          {config.pagedAttention && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <p className="text-[10px] text-emerald-400 leading-relaxed">
                {t("config.pagedEnabled")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}