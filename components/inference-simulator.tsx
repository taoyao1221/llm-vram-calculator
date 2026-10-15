"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, RotateCcw, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { translations } from "@/lib/i18n/messages";

interface InferenceSimulatorProps {
  ttftMs: number;
  tokensPerSecond: number;
  concurrentUsers: number;
  modelName: string;
  promptTokens: number;
  className?: string;
}

type SimPhase = "idle" | "prefill" | "generating" | "done";

function pickSampleOutput(samples: string[], seed: number): string {
  const count = 5;
  const idx = seed % samples.length;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    parts.push(samples[(idx + i) % samples.length]);
  }
  return parts.join(" ");
}

export function InferenceSimulator({
  ttftMs,
  tokensPerSecond,
  concurrentUsers,
  modelName,
  promptTokens,
  className,
}: InferenceSimulatorProps) {
  const { t, tn, locale } = useI18n();
  const samples =
    (translations[locale]?.sim?.samples as string[] | undefined) ??
    (translations.en.sim.samples as string[]);

  const [phase, setPhase] = useState<SimPhase>("idle");
  const [prefillProgress, setPrefillProgress] = useState(0); // 0-100
  const [displayedText, setDisplayedText] = useState("");
  const [generatedTokens, setGeneratedTokens] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ttftActual, setTtftActual] = useState<number | null>(null);

  const startTimeRef = useRef<number>(0);
  const prefillRafRef = useRef<number | null>(null);
  const genIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<string[]>(samples);
  samplesRef.current = samples;
  const sampleText = useRef<string>("");

  const cleanup = useCallback(() => {
    if (prefillRafRef.current) cancelAnimationFrame(prefillRafRef.current);
    if (genIntervalRef.current) clearInterval(genIntervalRef.current);
    prefillRafRef.current = null;
    genIntervalRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase("idle");
    setPrefillProgress(0);
    setDisplayedText("");
    setGeneratedTokens(0);
    setElapsedMs(0);
    setTtftActual(null);
    sampleText.current = pickSampleOutput(
      samplesRef.current,
      Math.floor(Math.random() * samplesRef.current.length)
    );
  }, [cleanup]);

  // Cap simulation TTFT: we animate prefill at real-time for small values,
  // but cap to 4s max for very slow GPUs.
  const simTtftMs = Math.min(ttftMs, 4000);
  // Cap tok/s display at reasonable animation speed (max 250 chars/s visual)
  const simTps = Math.min(tokensPerSecond, 250);

  const start = useCallback(() => {
    reset();
    // small delay to let state flush
    setTimeout(() => {
      setPhase("prefill");
      startTimeRef.current = performance.now();

      // Animate prefill progress
      const animatePrefill = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min((elapsed / simTtftMs) * 100, 100);
        setPrefillProgress(progress);
        setElapsedMs(elapsed);

        if (progress < 100) {
          prefillRafRef.current = requestAnimationFrame(animatePrefill);
        } else {
          // Prefill done
          const ttftTime = performance.now() - startTimeRef.current;
          setTtftActual(ttftTime);
          setPhase("generating");

          // Start token generation - split text into words for natural display
          const words = sampleText.current.split(/\s+/).filter(w => w.length > 0);
          let wordIdx = 0;
          const msPerToken = 1000 / simTps;

          genIntervalRef.current = setInterval(() => {
            if (wordIdx >= words.length) {
              cleanup();
              setPhase("done");
              return;
            }
            const word = words[wordIdx];
            // Display the word (add space before if not first word)
            setDisplayedText((prev) => prev ? prev + " " + word : word);
            // Estimate tokens: ~1.3 tokens per word on average (BPE tokenization)
            const tokensForWord = Math.max(1, Math.ceil(word.length / 4));
            setGeneratedTokens((n) => n + tokensForWord);
            setElapsedMs(performance.now() - startTimeRef.current);
            wordIdx++;
          }, msPerToken);
        }
      };

      prefillRafRef.current = requestAnimationFrame(animatePrefill);
    }, 50);
  }, [reset, simTtftMs, simTps, cleanup]);

  // Cleanup on unmount
  useEffect(() => () => cleanup(), [cleanup]);

  const totalElapsedS = elapsedMs / 1000;
  const liveGenRate =
    generatedTokens > 0 && ttftActual !== null
      ? generatedTokens / ((elapsedMs - ttftActual) / 1000)
      : null;

  const ttftLabel =
    simTtftMs < 1000 ? `${simTtftMs.toFixed(0)} ms` : `${(simTtftMs / 1000).toFixed(2)} s`;

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              phase === "idle" ? "bg-muted-foreground" :
              phase === "prefill" ? "bg-amber-400 animate-pulse" :
              phase === "generating" ? "bg-emerald-400 animate-pulse" :
              "bg-emerald-400"
            )}
          />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("sim.title")}
          </p>
          <span className="text-[10px] text-muted-foreground/60 font-normal hidden sm:block">
            — {modelName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {phase !== "idle" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={reset}
              title={t("sim.reset")}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          {(phase === "idle" || phase === "done") ? (
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={start}
            >
              <Play className="w-3 h-3" />
              {phase === "done" ? t("sim.replay") : t("sim.play")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={reset}
            >
              <Square className="w-3 h-3" />
              {t("sim.stop")}
            </Button>
          )}
        </div>
      </div>

      {/* Sim stats bar */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {[
          {
            label: t("sim.ttftEst"),
            value: ttftMs < 1000 ? `${ttftMs.toFixed(0)} ms` : `${(ttftMs / 1000).toFixed(2)} s`,
            icon: Clock,
            active: phase === "prefill",
          },
          {
            label: t("sim.tpsEst"),
            value: `${tokensPerSecond.toFixed(1)}`,
            icon: Zap,
            active: phase === "generating",
          },
          {
            label: t("sim.elapsed"),
            value: totalElapsedS > 0 ? `${totalElapsedS.toFixed(2)} s` : "—",
            icon: null,
            active: phase !== "idle" && phase !== "done",
          },
          {
            label: concurrentUsers > 1 ? tn("common.userCount", concurrentUsers) : t("sim.generated"),
            value: generatedTokens > 0 ? `${generatedTokens} tok` : "—",
            icon: null,
            active: phase === "generating",
          },
        ].map(({ label, value, icon: Icon, active }) => (
          <div
            key={label}
            className={cn(
              "px-3 py-2 flex flex-col gap-0.5 transition-colors",
              active ? "bg-primary/5" : ""
            )}
          >
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {Icon && <Icon className="w-3 h-3" />}
              {label}
            </span>
            <span
              className={cn(
                "text-sm font-mono font-semibold",
                active ? "text-primary" : "text-foreground"
              )}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Main simulation area */}
      <div className="p-4 min-h-[140px] flex flex-col gap-3">
        {phase === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-4">
            <Play className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {t("sim.pressPlay")}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {t("sim.prefillInfo", { ttft: ttftLabel, tps: simTps.toFixed(0) })}
              {simTtftMs < ttftMs ? t("sim.capped") : ""}
            </p>
          </div>
        )}

        {(phase === "prefill" || (phase !== "idle" && displayedText === "" && phase !== "done")) && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {t("sim.prefilling", { n: promptTokens.toLocaleString() })}
              </span>
              <span className="font-mono text-muted-foreground">
                {prefillProgress.toFixed(1)}%
              </span>
            </div>
            {/* Prefill progress bar */}
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-none"
                style={{ width: `${prefillProgress}%` }}
              />
            </div>
            {/* Token blocks animation */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(Math.floor(prefillProgress / 100 * promptTokens), 60) }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 rounded-sm bg-amber-500/30 transition-all"
                  style={{ width: `${4 + Math.random() * 12}px` }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("sim.computeBound")}
              {ttftMs > 1000 && t("sim.cappedNote")}
            </p>
          </div>
        )}

        {(phase === "generating" || phase === "done") && (
          <div className="flex flex-col gap-3">
            {ttftActual !== null && (
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/20">
                  {t("sim.ttftSimulated", {
                    v: ttftActual < 1000 ? `${ttftActual.toFixed(0)} ms` : `${(ttftActual / 1000).toFixed(2)} s`,
                  })}
                </span>
                {liveGenRate !== null && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                    {t("sim.liveRate", { v: liveGenRate.toFixed(1) })}
                  </span>
                )}
              </div>
            )}
            <div
              className={cn(
                "rounded-md border border-border bg-muted/20 p-3 text-sm text-foreground leading-relaxed font-mono min-h-[80px]",
                phase === "generating" && "border-emerald-500/20 bg-emerald-500/5"
              )}
            >
              {displayedText}
              {phase === "generating" && (
                <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
              )}
              {phase === "done" && !displayedText && (
                <span className="text-muted-foreground italic">{t("sim.outputComplete")}</span>
              )}
            </div>
            {phase === "done" && (
              <p className="text-[10px] text-muted-foreground">
                {t("sim.simComplete", {
                  n: generatedTokens,
                  s: ((elapsedMs - (ttftActual ?? 0)) / 1000).toFixed(2),
                })}
                {concurrentUsers > 1 && t("sim.simCompleteUsers", { n: concurrentUsers })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}