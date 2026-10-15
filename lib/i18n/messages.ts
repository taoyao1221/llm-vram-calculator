// ─── i18n message catalogs ────────────────────────────────────────────────────
// Display-language strings for the whole app. `en` is the source of truth;
// `zh` mirrors it. Keys are resolved by dot-path in `useI18n().t()`.
// `{name}` placeholders are interpolated from the params object.

export type Locale = "en" | "zh";

// Loose shape so new keys can be added freely on either locale.
export type Dictionary = { [key: string]: any };

const en: Dictionary = {
  common: {
    gpuCount: { one: "{n}× GPU", other: "{n}× GPUs" },
    userCount: { one: "{n} user", other: "{n} users" },
  },

  language: { label: "Language", en: "English", zh: "中文" },
  theme: { light: "Light", dark: "Dark", system: "System", toggle: "Toggle theme" },

  header: {
    appTitle: "LLM VRAM Calculator",
    tabCalculator: "Calculator",
    tabCompare: "Compare GPUs",
    heroTitle: "GPU Memory & Performance Estimator",
    heroDesc:
      "Estimate VRAM, TTFT, and tok/s for 100+ LLMs (HF + Ollama) across 70+ GPUs including H20, L20, RTX Pro 6000D Blackwell. Correct MoE formulas, up to 4096 concurrent users. Press Play to simulate inference.",
    configuration: "Configuration",
    estimates: "Estimates",
    resetDefaults: "Reset to defaults",
    footerDisclaimer:
      "Estimates are physics-based approximations. Real-world performance varies by framework, driver version, and system memory bandwidth. Validated against vLLM, llama.cpp, and Ollama benchmarks.",
  },

  config: {
    sectionGpu: "GPU Configuration",
    sectionModel: "Model",
    sectionPrecision: "Precision",
    sectionContext: "Context & Workload",
    sectionInference: "Inference Optimizations",

    provider: "Provider",
    gpuModel: "GPU Model",
    vram: "VRAM",
    memBw: "Mem BW",
    fp16Tf: "FP16 TF",
    numGpus: "Number of GPUs",

    searchProvider: "Search provider...",
    searchGpus: "Type to search GPUs...",
    selectGpuCount: "Select GPU count...",
    gpuVramSub: "{vram} GB VRAM · {bw} GB/s · {tf} TF",
    totalVramSub: "{gb} GB total VRAM",

    source: "Source",
    family: "Family",
    model: "Model",
    availableModels: "({n} available)",
    allFamilies: "All Families",
    allSources: "All Sources",
    searchFamily: "Search family...",
    typeModelName: "Type model name...",
    modelDenseSub: "{params}B params · {layers} layers · {kv} KV heads",
    modelMoeSub: "{params}B total · {active}B active · {experts} experts",

    totalParams: "Total Params",
    params: "Params",
    activeParams: "Active Params",
    layers: "Layers",
    kvHeads: "KV Heads",

    moeLabel: "Mixture-of-Experts:",
    moeDesc:
      "{active} of {total} experts active per token. VRAM = total params ({params}B). TTFT and tok/s use active params ({activeParams}B).",

    weightQuant: "Weight Quantization",
    kvPrecision: "KV Cache Precision",
    searchQuant: "Search quantization...",
    searchKv: "Search KV precision...",

    contextWindow: "Context Window",
    promptLength: "Prompt Length (TTFT)",
    concurrentUsers: "Concurrent Users",
    maxFor: "Max for {model}: {ctx}",
    highConcurrency:
      "High concurrency: ensure total KV cache VRAM fits on your hardware. Each additional user adds {gb} GB of KV cache.",
    unitUsers: " users",
    unitTokens: " tokens",

    pagedAttention: "Paged Attention",
    pagedAttentionDesc: "Reduces KV cache overhead by ~25%",
    specDecoding: "Speculative Decoding",
    specDecodingDesc: "Draft / MTP model predicts, main model verifies",
    standard: "Standard",
    mtpMode: "MTP Mode",
    draftModelSize: "Draft Model Size",
    draftTokens: "Draft Tokens per Step",
    specResult:
      "Draft model adds ~{gb} GB VRAM. Estimated speedup: {speedup}× at ~60% acceptance rate.",
    mtpNoteStrong: "MTP (Multi-Token Prediction):",
    mtpNote:
      " Built-in speculative decoding using the model's native MTP heads. No separate draft model needed — adds only ~0.3 GB VRAM for the MTP heads. Compatible with DeepSeek V3 and R1 series. Estimated speedup: ~1.8×.",

    expertOffloading: "Expert Offloading",
    expertOffloadingDesc: "Keep select experts on GPU, offload rest to CPU",
    expertsOnGpu: "Experts on GPU",

    suggestionStrong: "💡 Suggestion:",
    suggestionKeep: " Try keeping at least ",
    suggestionExperts: "{n} experts",
    suggestionOnGpu: " on GPU.",
    suggestionActiveMulti:
      " Your model activates {active} experts per token, so fewer than this causes frequent PCIe transfers.",
    suggestionActiveOne:
      " Even with 1 active expert, keeping ~15% of experts on GPU provides load-balancing buffer when routing shifts.",

    vramSavedStrong: "VRAM saved:",
    vramSaved: " ~{gb} GB on weights (expert FFN layers are ~70% of total params).",
    offloadedExperts: " Offloaded experts: {offloaded}/{total}",

    recommendedRangeStrong: "✅ Recommended range:",
    recommendedRange:
      " {min}–{max} experts on GPU balances VRAM savings with performance.",
    keepingPct: " Keeping {pct}% of experts on GPU.",

    whyMattersStrong: "Why this matters:",
    whyMatters:
      " In MoE models, only {active} of {total} experts compute per token, but all expert weights must be loaded into VRAM. Offloading experts to CPU saves ~{gb} GB but adds PCIe transfer latency when offloaded experts are needed.",
    warningThrashing:
      " ⚠️ WARNING: Fewer experts on GPU than active per token ({active}) — this will cause severe PCIe thrashing!",

    critical:
      "Critical: Keeping fewer experts on GPU than active per token ({active}) will cause frequent PCIe transfers, severely degrading performance. Increase \"Experts on GPU\" immediately.",
    allExpertsOnGpu:
      "All experts on GPU — no offloading needed. Reduce \"Experts on GPU\" to save VRAM.",

    pagedEnabled:
      "Paged attention enabled: KV cache memory reduced by ~25%. This is the default for vLLM, SGLang, and TensorRT-LLM.",

    tip: {
      gpuModel:
        "Select GPU to run inference on. VRAM, memory bandwidth, and TFLOPS directly affect all estimates.",
      numGpus:
        "Tensor parallelism splits the model across GPUs. More GPUs increase total VRAM and improve throughput at the cost of inter-GPU communication overhead.",
      weightQuant:
        "Quantization reduces bits per weight. Lower bits = less VRAM and faster decode (memory-bound), but potential quality loss. BF16 is the reference quality baseline.",
      kvPrecision:
        "Key-Value cache precision. Lower = less VRAM per token per layer, allowing longer contexts or more concurrent users at the cost of slight quality degradation.",
      contextWindow:
        "Total tokens (prompt + generation) held in KV cache. Larger contexts consume significantly more VRAM — linear scaling. Click the value badge to type a custom size.",
      promptLength:
        "Input tokens used to estimate Time-to-First-Token. Prefill is compute-bound and scales with prompt length. Click the badge to type a custom value.",
      concurrentUsers:
        "Number of simultaneous inference requests (batch size). Each user multiplies KV cache VRAM linearly. More users reduce per-user throughput but improve GPU utilization. Click badge to type up to 1024.",
      pagedAttention:
        "vLLM-style paged KV cache. Reduces memory fragmentation by ~20-40%, enabling longer contexts and more concurrent users. Standard in vLLM, SGLang, and TensorRT-LLM.",
      specDecoding:
        "Uses a small draft model or MTP heads to predict multiple tokens, then verifies with the main model in parallel. Can improve throughput 1.5-3×.",
      draftModelSize:
        "Size of the draft model in billions of parameters. Smaller = faster drafting but lower acceptance rate. Common choices: 0.5B-1.5B for 7B+ main models.",
      draftTokens:
        "Number of tokens the draft model generates before verification. More tokens = higher potential speedup but lower acceptance rate. Typical: 4-8 tokens.",
      expertOffloading:
        "Offloads some experts to CPU RAM, keeping only N experts in VRAM. Reduces VRAM usage at the cost of PCIe latency when offloaded experts are accessed. Useful for fitting large MoE models on limited VRAM.",
      expertsOnGpu:
        "Number of experts to keep in VRAM. The rest are offloaded to CPU. Active experts should always be on GPU for best performance.",
    },
  },

  results: {
    fitFits: "Fits comfortably",
    fitTight: "Tight fit (>85%)",
    fitOverflow: "Insufficient VRAM",
    requiredAvailable: "{req} required / {avail} available ({n}× {gpu})",
    minGpusNeeded: "Minimum GPUs needed:",
    vramUtilization: "VRAM Utilization",
    vramUtilizationValue: "{pct}% of {total}",

    legendWeights: "Weights",
    legendKvCache: "KV Cache",
    legendActivations: "Activations",
    legendDraft: "Draft",
    legendMtp: "MTP Heads",
    pagedSuffix: "(paged)",

    totalVram: "Total VRAM",
    timeToFirstToken: "Time to First Token",
    tokensPerSecond: "Tokens / Second",
    totalVramSub: "{quant} · {users}",
    ttftSub: "{prompt} prompt tokens · {n}× GPU · {params}",
    ttftSubActive: "{active}B active params",
    ttftSubParams: "{params}B params",
    tpsSub: "Per user · {total} tok/s total · {bw} GB/s eff. BW",

    overflowTitle: "VRAM Insufficient ({req} needed, {avail} available):",
    overflowBody1:
      " Model weights and KV cache exceed GPU memory. The simulator below shows ",
    overflowBodyStrong: "estimated throughput with severe CPU offloading penalty",
    overflowBody2:
      " — effective bandwidth drops from ~{hbm} GB/s (HBM) to ~{pcie} GB/s (PCIe page swap). ",
    overflowBody3: "{n}×{gpu} can hold at most ~{max} GB. ",
    overflowBodyStrong2:
      "Recommendation: use more/faster GPUs, reduce context length, or switch to lower quantization.",
    overflowBody4:
      " Despite the overflow, the simulation estimates token speed assuming partial CPU offloading — expect significantly slower throughput than the fit case.",

    diffusionStrong: "Diffusion Model:",
    diffusionBody1: " {model} uses a diffusion-based text generation process rather than standard autoregressive decoding. This means significantly higher TTFT (denoising iterations before first token) but potentially ",
    diffusionBodyStrong: "faster overall token generation",
    diffusionBody2:
      " once denoising converges, as each step produces higher-quality tokens requiring fewer retries. The simulation estimates {ttft} ms TTFT (×3 for denoising) and ~{tps} tok/s decode.",

    moeStrong: "MoE Calculation Notes:",
    moeTotalParams: "{params}B total params",
    moeActiveParams: "{active}B active params",
    moeBody1: " Weights VRAM uses ",
    moeBody2: " (all experts loaded). TTFT and tok/s use ",
    moeBody3: " ({active}/{total} experts, {pct}% of weights). This gives {model} significantly faster inference than a dense model of the same total size.",

    optStrong: "Inference Optimizations Active:",
    optPaged:
      "Paged attention reduces KV cache memory by ~25% through dynamic memory allocation. ",
    optSpecStandard1: "Speculative decoding with {size}B draft model adds ",
    optSpecStandard2:
      " VRAM but can improve throughput by 1.5-3× depending on acceptance rate. ",
    optSpecMtp1:
      "MTP speculative decoding using the model's native multi-token prediction heads. No separate draft model needed — only ",
    optSpecMtp2: " for MTP heads. Estimated ~1.8× throughput improvement. ",
    optOffload1: "Expert offloading active: {n} of {total} experts on GPU, rest offloaded to CPU. VRAM reduced from {full} to ",
    optOffload2: " for weights.",

    vramBreakdown: "VRAM Breakdown",
    bwModelWeights: "Model Weights",
    bwKvCache: "KV Cache",
    bwActivations: "Activations",
    bwDraft: "Draft Model (Spec. Decoding)",
    bwMtp: "MTP Heads (Spec. Decoding)",
    total: "Total",

    bwWeightsSub: "{params}B params × {bpw} bpw × {overhead}× overhead{extra}",
    bwWeightsMoEOnGpu: " ({n}/{total} experts on GPU)",
    bwWeightsMoEAll: " ({n} experts, all loaded)",
    bwKvSub:
      "2 × {kvHeads} KV heads × {headDim} head dim × {ctx} ctx × {layers} layers × {users} × {bytes}B{paged}",
    bwKvPaged: " (~25% paged)",
    bwActivationsSub: "{users} × {ctx} ctx × {hidden} hidden × 2B{extra}",
    bwActivationsMoE: " + MoE routing overhead",
    bwDraftSub: "{size}B draft model × {bpw} bpw",
    bwMtpSub: "Multi-Token Prediction heads (~0.3 GB, built into model)",

    tensorParallelStrong: "Tensor Parallelism ({n}× GPUs):",
    tensorParallel1: " Weights sharded across {n} GPUs — each holds ",
    tensorParallel2: " of weights. Effective memory bandwidth: ",
    tensorParallel3: " GB/s",
    tensorParallelNvlink: " (NVLink, 85% efficiency)",
    tensorParallelPcie: " (PCIe, 65% efficiency)",
    tensorParallel4: ". TTFT uses {n}× {tf} TF = ",
    tensorParallel5: " TF effective.",

    concurrencyStrong: "Concurrency ({n} users):",
    concurrency1: " Each user requires {kvPerUser} GB KV cache. Total KV: ",
    concurrency2: ". System total throughput: ",
    concurrency3: " shared across all users ({tps} tok/s per user).",

    formulaReference: "Formula Reference",
    fWeightsTitle: "Model Weights VRAM",
    fWeightsFormula1: "weights_GB = total_params × 10⁹ × (bits_per_weight / 8) × overhead / 1024³",
    fWeightsMoe: "[MoE] ALL {n} expert weights are loaded into VRAM.",
    fWeightsExample: "Example: {params}B × {bpw} B × {overhead} ÷ 1024³",
    fWeightsResult: "       = {gb} GB",
    fWeightsExplMoE:
      "For MoE models, ALL expert weights must reside in VRAM simultaneously, even though only {active} of {total} are active per token. The overhead factor accounts for quantization tables, routing weights, and framework buffers.",
    fWeightsExplDense:
      "Each model parameter is stored at a precision determined by quantization. The overhead factor accounts for quantization lookup tables, framework buffers, and alignment padding.",

    fKvTitle: "KV Cache VRAM",
    fKvFormula1: "kv_GB = 2 × kv_heads × head_dim × seq_len × layers × users × bytes_per_kv / 1024³",
    fKvHeadDim: "head_dim = hidden_dim / num_heads = {hidden} / {heads} = {headDim}",
    fKvMoe: "[MoE] KV cache depends on attention only, NOT on expert count.",
    fKvExample: "kv_GB = 2 × {kvHeads} × {headDim} × {ctx} × {layers} × {users} × {bytes}",
    fKvResult: "     = {gb} GB",
    fKvExpl:
      "The KV cache stores Key and Value tensors for every transformer layer. With GQA ({kvHeads} KV heads vs {heads} attention heads), the cache is {factor}× smaller than MHA. KV cache scales linearly with context length and concurrent users. For MoE models, the attention architecture is independent of expert routing.",

    fTtftTitle: "Time to First Token",
    fTtftTitleMoE: "Time to First Token (MoE)",
    fTtftMoe: "[MoE] FLOPs use ACTIVE params ({active}B), not total ({total}B)",
    fTtftFormula: "ttft = 2 × {p} × prompt_tokens / (tflops × 10¹² × gpus × eff)",
    fTtftActive: "active_params",
    fTtftParams: "params",
    fTtftPrefill: "Prefill FLOPs = 2 × {active}B × {prompt} = {gflop}G",
    fTtftEff: "Eff. TFLOPS = {tf} × {n} × {tpEff} × {quantEff} = {eff} TF",
    fTtftResult: "TTFT = {s} s = {display}",
    fTtftExplMoE:
      "CRITICAL for MoE: TTFT uses ACTIVE params ({active}B), not total params ({total}B). Only {nActive} of {nTotal} experts compute per token during prefill. This is why MoE models like {model} achieve fast TTFT despite large total parameter counts.",
    fTtftExplDense:
      "Prefill is compute-bound: all prompt tokens processed in parallel. TTFT scales with model size and prompt length. More GPUs reduce TTFT via tensor parallelism (~80% efficiency on NVLink).",

    fTpsTitle: "Tokens Per Second",
    fTpsTitleMoE: "Tokens Per Second (MoE)",
    fTpsMoe: "[MoE] Bandwidth uses ACTIVE params ({active}B) — only active expert weights are streamed",
    fTpsFormula: "tps = eff_bandwidth / ({p} × bytes_per_weight / gpus) / users",
    fTpsActive: "active_params",
    fTpsParams: "params",
    fTpsEffBw: "eff_BW = {bw} GB/s",
    fTpsBytes: "bytes/token = {active}B × {bpw} B/w / {n} GPU = {gb} GB",
    fTpsRaw: "tps (raw) = {raw} tok/s",
    fTpsPerUser: "tps/user  = {tps} tok/s",
    fTpsExplMoE:
      "CRITICAL for MoE: Decode throughput uses ACTIVE params ({active}B). During decoding, only the {nActive} active experts are streamed from HBM per token. Total params ({total}B) are in VRAM but not all are read each step, giving MoE models a major throughput advantage over equivalent dense models.",
    fTpsExplDense:
      "Token generation is memory-bandwidth bound: model weights stream from VRAM per token. Quantization directly improves throughput by reducing bytes streamed. Concurrent users share bandwidth but batching adds a slight utilization benefit.",

    keySensitivities: "Key Sensitivities",
    sensContextLabel: "Context ×2",
    sensContextImpact: "KV cache → {total} GB (+{delta} GB)",
    sensUsersLabel: "Users ×2",
    sensUsersImpact: "KV+Act → {total} GB · TPS/user ÷2 · Total TPS same",
    sensQuantLabel: "Q4 vs BF16",
    sensQuantImpact: "Weights: {saved} saved · ~2.5× faster decode",
    sensMoeLabel: "MoE vs Dense",
    sensMoeImpact: "{factor}× larger VRAM vs dense {active}B, but same compute speed",
  },

  compare: {
    provider: "Provider",
    tier: "Tier",
    gpusPerNode: "GPUs per node",
    comparingFor: "Comparing for",
    comparingSub: "{quant} · {ctx}K ctx · {users}",
    moeActiveTotal: "{active}B active / {total}B total",
    allProviders: "All Providers",
    allTiers: "All Tiers",
    tierConsumer: "Consumer / Gaming",
    tierProsumer: "Pro / Workstation",
    tierDatacenter: "Datacenter / Cloud",
    searchProvider: "Search provider...",
    searchTier: "Search tier...",
    selectGpuCount: "Select GPU count...",

    moeStrong: "MoE GPU comparison:",
    moeNote:
      " VRAM requirements are based on total params ({params}B — all experts must fit). TTFT and Tok/s are based on active params ({active}B). This is why MoE models need more VRAM but run faster than equivalent-sized dense models.",

    colGpu: "GPU",
    colMinGpus: "Min GPUs",
    colGpuVram: "GPU VRAM",
    colTtft: "TTFT",
    colTpsPerUser: "Tok/s (per user)",
    colTotalTps: "Total Tok/s",
    colMemBw: "Mem BW",

    footerFit:
      "{fits} of {total} GPUs can fit this model with {n}× GPU{plural}. Dimmed rows need more GPUs.",
    footerSort:
      "Click column headers to sort. Award icon = best in category.",
  },

  sim: {
    title: "Inference Simulation",
    play: "Play",
    replay: "Replay",
    stop: "Stop",
    reset: "Reset",
    ttftEst: "TTFT (est.)",
    tpsEst: "Tok/s (est.)",
    elapsed: "Elapsed",
    generated: "Generated",
    pressPlay: "Press Play to simulate inference",
    prefillInfo:
      "Prefill: {ttft} animation · Decode: ~{tps} tok/s",
    capped: " (capped for display)",
    prefilling: "Prefilling {n} prompt tokens...",
    computeBound:
      "Compute-bound prefill pass — processing all prompt tokens in parallel",
    cappedNote: " (simulated at 4s max; real TTFT shown above)",
    ttftSimulated: "TTFT: {v} simulated",
    liveRate: "{v} tok/s live",
    outputComplete: "Output complete.",
    simComplete:
      "Simulation complete — {n} tokens generated in {s} s decode time",
    simCompleteUsers: " ({n} concurrent users share bandwidth)",
    samples: [
      "Large language models require significant GPU memory for deployment. The memory requirements scale with both the number of parameters and the precision used during inference. For a 7B parameter model in BF16, you need approximately 14 GB of VRAM just for the weights, before accounting for KV cache, activations, and framework overhead. Quantization reduces this by storing weights at lower precision. For example, Q4_K_M uses 4.5 bits per weight, cutting memory by about 3.5x compared to FP16. This allows models that would normally require multiple GPUs to run on a single consumer GPU. The key trade-off is between model quality and memory usage. Lower precision quantization introduces more noise into the weights, which can degrade output quality for complex tasks like reasoning and mathematics. For simple tasks like text completion or summarization, aggressive quantization often works well with minimal quality loss.",
      "Mixture-of-Experts architectures offer a compelling trade-off: by activating only a subset of experts per token, MoE models can achieve the quality of much larger dense models while keeping compute and memory bandwidth costs proportional to the active parameter count. In an MoE model with 256 total experts and 8 active per token, only about 3 percent of the total parameters are computed for each forward pass, yet all expert weights must remain in GPU memory. This is why a model like DeepSeek V3 with 685 billion total parameters can achieve inference speeds comparable to a 37 billion parameter dense model. The KV cache for MoE models is also independent of expert count since it depends only on the attention layers, not the feed-forward expert layers. Expert offloading can further reduce VRAM usage by keeping only frequently used experts on the GPU while offloading others to CPU memory.",
      "When deploying LLMs in production, the token generation rate is fundamentally memory-bandwidth bound. Each decode step requires streaming the full model weights from HBM to compute units regardless of how powerful GPU tensor cores are. This means that memory bandwidth is usually the primary bottleneck for inference throughput. For a model with active parameters A and quantization of B bytes per parameter, each generated token requires reading A times B bytes from memory. With a memory bandwidth of 1000 GB per second, a 70B parameter model at 4-bit quantization can generate approximately 1000 divided by 70 times 0.5 tokens per second, or around 28 tokens per second. Using tensor parallelism across multiple GPUs increases effective bandwidth proportionally but adds communication overhead.",
      "Context window size has a quadratic relationship with attention compute but only a linear relationship with KV cache memory. A 128K context window requires 32 times more KV cache memory than a 4K window, making quantized KV cache essential for long-context deployments. The KV cache stores key and value tensors for every token in the sequence across all attention layers. With Grouped Query Attention using 8 KV heads instead of 32 query heads, the KV cache is 4 times smaller than standard multi-head attention. For a 70B model with 80 layers processing 128K context, the KV cache alone can exceed 50 GB of VRAM per user. Paged attention algorithms used in vLLM and similar frameworks reduce memory fragmentation by dynamically allocating KV cache blocks, saving approximately 20 to 40 percent of KV cache memory.",
      "With tensor parallelism across 8 GPUs, inference throughput scales near-linearly for memory-bandwidth-bound workloads, while TTFT benefits from the combined TFLOPS though inter-GPU communication overhead becomes the bottleneck at higher GPU counts. Each GPU holds a shard of the model weights and computes its portion of each transformer layer. For the forward pass, GPUs must communicate via NVLink or Infinity Fabric to synchronize attention outputs and feed-forward network results. The communication overhead scales with model dimension and sequence length, and can dominate at very large GPU counts. For optimal efficiency, models should be large enough to justify the communication cost. A rule of thumb is that each GPU should hold at least 5 to 10 billion parameters worth of sharded weights.",
      "Speculative decoding is a technique to accelerate text generation by using a small draft model to predict multiple tokens ahead, which are then verified in parallel by the main model. This works because the draft model runs much faster due to its smaller size, while the verification pass by the main model can process multiple tokens simultaneously. The typical speedup is 1.5 to 3 times depending on the draft model size, the acceptance rate of drafted tokens, and the number of draft tokens per step. Multi-Token Prediction or MTP takes this further by building the speculative heads directly into the main model, eliminating the need for a separate draft model. DeepSeek V3 and R1 series support MTP natively, achieving approximately 1.8 times throughput improvement with only a tiny VRAM overhead for the additional prediction heads.",
    ],
  },

  accuracy: {
    title: "Quantization Accuracy Impact",
    qatBadge: "QAT-optimized family",
    summaryStrong: "Estimated MMLU-Pro point drop",
    summarySuffix: " vs BF16 baseline.",
    summaryQat1: " ",
    summaryQat2:
      " was trained with Quantization-Aware Training (QAT), preserving ~70% more accuracy at Q4 compared to standard post-training quantization (PTQ). Typical PTQ Q4_K_M loses ~5-6 pts; QAT version loses only ~2 pts.",
    summaryDense1:
      "Larger models ({params}B) tolerate quantization better than smaller ones.",
    summaryDenseMoe: " MoE variant: {active}B active params.",
    baseline: "baseline",
    pts: "{delta} pts",
    legendLeft: "Left = lower accuracy",
    legendBar: "Bar width ∝ accuracy loss",
    legendWeights1: "Weights: ",
    legendWeights2: " (BF16)",
    showDetails: "Show",
    hideDetails: "Hide",
    detailsSuffix: " detailed accuracy notes",
    currentSelected: "Currently selected:",
    currentEstimated: " — estimated ",
    currentNoLoss: "no accuracy loss",
    currentDrop: "{delta}-point drop",
    currentSuffix: " on MMLU-Pro vs BF16 baseline.",
    currentSaves: "· Saves {gb} GB VRAM on weights",
  },

  share: {
    button: "Share Config",
    title: "Share Configuration",
    description:
      "Copy this URL to share your current configuration with others. The URL contains all your settings (GPU, model, quantization, context length, etc.).",
    gpu: "GPU:",
    model: "Model:",
    quantization: "Quantization:",
    context: "Context:",
    users: "Users:",
    estVram: "Est. VRAM:",
    shareableUrl: "Shareable URL",
    openInNewTab: "Open in New Tab",
    copyUrl: "Copy URL",
    copied: "Copied!",
    toastSuccess: "Configuration URL copied to clipboard!",
    toastError: "Failed to copy URL. Please try again.",
  },

  select: {
    defaultPlaceholder: "Select...",
    defaultSearch: "Search...",
    noResults: "No results for \"{q}\"",
    resultCount: "{n} result(s)",
    resultCountFor: " for \"{q}\"",
    typeValue: "Click to type a value",
  },

  tier: {
    consumer: "consumer",
    prosumer: "prosumer",
    datacenter: "datacenter",
  },

  quant: {
    fp32: { qualityNote: "Reference quality, extremely high VRAM usage" },
    bf16: { qualityNote: "Near-lossless — standard training and inference dtype" },
    fp16: { qualityNote: "Near-lossless; same size as BF16, slightly lower range" },
    fp8_e4m3: { qualityNote: "Minimal quality loss; supported on H100/H200/B200" },
    q8_0: { qualityNote: "Minimal quality loss, ~2× memory saving vs BF16" },
    q6_k: { qualityNote: "Very low quality loss, good memory efficiency" },
    q5_k_m: { qualityNote: "Balanced quality and memory efficiency" },
    q5_k_s: { qualityNote: "Slightly smaller than Q5_K_M with minor quality drop" },
    q4_k_m: { qualityNote: "Popular choice; slight quality loss, major memory saving" },
    q4_k_s: { qualityNote: "Slightly smaller variant of Q4_K_M" },
    q4_0: { qualityNote: "More quality loss, very memory efficient" },
    iq4_xs: { qualityNote: "iQuant 4-bit; better quality than Q4_0 at similar size" },
    q3_k_m: { qualityNote: "Noticeable quality loss; only for resource-limited setups" },
    q3_k_s: { qualityNote: "Further quality degradation vs K_M variant" },
    q2_k: { qualityNote: "Significant quality loss — minimum VRAM footprint" },
    iq1_m: { qualityNote: "Very poor quality — experimental, only for huge models" },
    int8: { qualityNote: "Good quality, requires CUDA; widely used with bitsandbytes" },
    nf4: { qualityNote: "4-bit NormalFloat; used in QLoRA fine-tuning and inference" },
    awq: { qualityNote: "Activation-aware quantization; excellent quality/speed trade-off" },
    awq_2: { qualityNote: "Aggressive 2-bit AWQ; significant quality loss" },
    gptq4: { qualityNote: "Post-training quantization; widely used on HuggingFace" },
    gptq8: { qualityNote: "High quality GPTQ; minimal accuracy loss" },
    gguf_f16: { qualityNote: "Full precision in GGUF format for llama.cpp / Ollama" },
  },

  kv: {
    fp32: { qualityNote: "Maximum precision, rarely needed in practice" },
    fp16: { qualityNote: "Standard default; no measurable quality loss" },
    fp8: { qualityNote: "Minimal quality impact; ~2× KV memory saving vs FP16" },
    int8: { qualityNote: "Slight quality loss; good memory/accuracy trade-off" },
    int4: { qualityNote: "Noticeable quality impact; maximum compression" },
  },

  modelNotes: {
    llama4_scout: "16 experts, 1 active, 10M ctx",
    llama4_maverick: "128 experts, 1 active",
    mixtral_8x7b: "8 experts, 2 active per token",
    mixtral_8x22b: "8 experts, 2 active per token",
    qwen3_30b_moe: "128 experts, 8 active",
    qwen3_235b_moe: "128 experts, 8 active",
    gemma4_31b: "Dense; 256K ctx; multimodal text+image; QAT available",
    gemma4_26b_a4b: "128 experts, 3 routed active; 256K ctx; QAT available",
    gemma4_12b:
      "QAT-optimized; first mid-sized Gemma with native audio; runs on 16GB VRAM; near 26B performance",
    gemma4_4b:
      "QAT-optimized; per-layer embeddings; edge-optimized; runs on Raspberry Pi 5",
    gemma4_e2b: "QAT-optimized; smallest Gemma 4; per-layer embeddings; on-device",
    diffusiongemma_26b_a4b:
      "64 experts, 4 active; diffusion-based text generation (parallel block denoising, not autoregressive)",
    qwen36_27b:
      "Dense; hybrid Gated DeltaNet; 262K native, 1M ext; MTP support; flagship coding",
    qwen36_35b_a3b:
      "256 experts, 8 routed active + 1 shared; agentic coding; beats Gemma 4-31B on coding",
    glm5_744b:
      "GlmMoeDSA arch; 256 experts, 8 active; 200K ctx; MIT license; SWE-bench 77.8%; AIME 92.7%",
    phi4_moe: "16 experts, 2 active",
    deepseek_v2: "MLA attention + 160 experts, 6 active",
    deepseek_v3: "MLA + 256 experts, 8 active",
    deepseek_r1: "Same arch as V3 + RL reasoning",
    devstral: "Code-focused Mistral Small variant",
    llama31_8b: "Instruction-tuned variant",
    deepseek_r1_0528: "Updated R1 checkpoint May 2025",
    deepseek_v2_5: "Merged chat+code V2 checkpoint",
    deepseek_prover_v2: "Math/theorem proving",
    gemma3n_e2b: "Efficient mobile-class model",
    gemma3n_e4b: "Efficient on-device model",
    command_a: "256K context, 2 of 8 experts active",
    granite_moe_3b: "32 experts, 8 active",
    bakllava_7b: "Multimodal (text shown; vision encoder adds ~300 MB)",
    nomic_embed: "Embedding model, not generative",
    qwen35_0_8b: "Dense; hybrid linear+full attention; unified VLM",
    qwen35_2b: "Dense; hybrid linear+full attention; unified VLM",
    qwen35_4b: "Dense; hybrid linear+full attention; unified VLM",
    qwen35_9b: "Dense; hybrid linear+full attention; unified VLM",
    qwen35_27b: "Dense; hybrid linear+full attention; unified VLM",
    qwen35_35b_a3b: "256 experts, 8 routed active + 1 shared; moe_intermediate_size=512",
    qwen35_122b_a10b: "256 experts, 8 routed active + 1 shared; moe_intermediate_size=1024",
    qwen35_397b_a17b: "512 experts, 10 routed active + 1 shared; flagship multimodal MoE",
    glm4_9b: "GQA; supports tool-call & vision variants",
    glm4_9b_long: "2M-token context via LongWriter",
    glm4_32b: "Dense, open-weight",
    glm4_plus_9b: "Improved instruction-following over GLM-4 9B",
    glmz1_9b: "Reasoning / rumination model; extended thinking budget",
    glmz1_32b: "Reasoning model; top open-source score on AIME 2025",
    glmz1_32b_moe: "Sparse 96B total, 32B active; 8 experts, 3 active",
    glm5: "256 routed + 1 shared expert, 8+1 active; DSA attention; agentic engineering",
    glm5_1:
      "256 routed + 1 shared, 8+1 active; GlmMoeDSA; 202K ctx, 131K output; SWE-Bench Pro 58.4",
    glm5_2: "Index share MoE; 1M ctx, 131K output; MTP heads; high/max thinking effort",
    kimi_k2: "384 experts, 8 active; MLA; 128K ctx; MuonClip optimizer",
    kimi_k2_thinking: "384 experts, 8 active; MLA; 256K ctx; native INT4 quantized",
    kimi_k2_5:
      "Multimodal (text+image+video); MoonViT; Agent Swarm 100 agents; INT4 pre-quantized",
    hy3: "192 routed + 1 shared experts, 8 active; first layer dense; MTP layer; Apache 2.0",
    hy3_fp8:
      "FP8 quantized variant; ~129.6GB VRAM at FP8; 192 routed + 1 shared experts, 8 active",
    kimi_k2_6:
      "384 experts, 8 active; MLA; 256K ctx; Agent Swarm 300 agents; Modified MIT license",
    kimi_k3: "2088 experts, 16 active; hybrid linear+full attention; 256K ctx; multimodal",
    deepseek_v4: "256 experts, 6 active; CSA+HCA hybrid attention; native FP8; 1M ctx",
    nemotron_9b: "Mamba2-Transformer hybrid; 128K ctx; competitive with Llama-3.2-11B",
    qwen25_coder_0_5b: "Code-specialized Qwen2.5; 32K native, 128K via YaRN; FIM support",
    qwen25_coder_1_5b: "Code-specialized Qwen2.5; 32K native, 128K via YaRN; FIM support",
    qwen25_coder_3b: "Code-specialized Qwen2.5; 32K native, 128K via YaRN; FIM support",
    qwen25_coder_7b: "Code-specialized Qwen2.5; 6.53B non-embedding params; 128K via YaRN",
    qwen25_coder_14b: "Code-specialized Qwen2.5; 128K via YaRN",
    qwen25_coder_32b: "SOTA open-source code model; matches GPT-4o on coding; 128K via YaRN",
  },
};

const zh: Dictionary = {
  common: {
    gpuCount: { one: "{n}× GPU", other: "{n}× GPU" },
    userCount: { one: "{n} 个用户", other: "{n} 个用户" },
  },

  language: { label: "语言", en: "English", zh: "中文" },
  theme: { light: "浅色", dark: "深色", system: "跟随系统", toggle: "切换主题" },

  header: {
    appTitle: "LLM 显存计算器",
    tabCalculator: "计算器",
    tabCompare: "显卡对比",
    heroTitle: "GPU 显存与性能估算",
    heroDesc:
      "为 100+ 大模型（HF + Ollama）在 70+ 款 GPU（含 H20、L20、RTX Pro 6000D Blackwell）上估算显存、首 token 时延（TTFT）与 tok/s。采用正确的 MoE 公式，支持最高 4096 并发用户。点击播放可模拟推理过程。",
    configuration: "配置",
    estimates: "估算结果",
    resetDefaults: "恢复默认",
    footerDisclaimer:
      "估算基于物理模型近似。实际性能因推理框架、驱动版本与系统内存带宽而异。已与 vLLM、llama.cpp、Ollama 基准进行校验。",
  },

  config: {
    sectionGpu: "GPU 配置",
    sectionModel: "模型",
    sectionPrecision: "精度",
    sectionContext: "上下文与负载",
    sectionInference: "推理优化",

    provider: "厂商",
    gpuModel: "GPU 型号",
    vram: "显存",
    memBw: "显存带宽",
    fp16Tf: "FP16 算力",
    numGpus: "GPU 数量",

    searchProvider: "搜索厂商...",
    searchGpus: "输入以搜索 GPU...",
    selectGpuCount: "选择 GPU 数量...",
    gpuVramSub: "{vram} GB 显存 · {bw} GB/s · {tf} TF",
    totalVramSub: "{gb} GB 总显存",

    source: "来源",
    family: "系列",
    model: "模型",
    availableModels: "（可用 {n} 个）",
    allFamilies: "全部系列",
    allSources: "全部来源",
    searchFamily: "搜索系列...",
    typeModelName: "输入模型名称...",
    modelDenseSub: "{params}B 参数 · {layers} 层 · {kv} KV 头",
    modelMoeSub: "{params}B 总量 · {active}B 激活 · {experts} 个专家",

    totalParams: "总参数量",
    params: "参数量",
    activeParams: "激活参数量",
    layers: "层数",
    kvHeads: "KV 头数",

    moeLabel: "混合专家（MoE）：",
    moeDesc:
      "每个 token 激活 {total} 个专家中的 {active} 个。显存按总参数量（{params}B）计算；TTFT 与 tok/s 按激活参数量（{activeParams}B）计算。",

    weightQuant: "权重量化",
    kvPrecision: "KV 缓存精度",
    searchQuant: "搜索量化...",
    searchKv: "搜索 KV 精度...",

    contextWindow: "上下文窗口",
    promptLength: "提示词长度（TTFT）",
    concurrentUsers: "并发用户数",
    maxFor: "{model} 上限：{ctx}",
    highConcurrency:
      "高并发提示：请确保 KV 缓存总显存不超过硬件容量。每增加一个用户，KV 缓存增加 {gb} GB。",
    unitUsers: " 个用户",
    unitTokens: " 个 token",

    pagedAttention: "分页注意力",
    pagedAttentionDesc: "将 KV 缓存开销降低约 25%",
    specDecoding: "投机解码",
    specDecodingDesc: "草稿/MTP 模型预测，主模型校验",
    standard: "标准模式",
    mtpMode: "MTP 模式",
    draftModelSize: "草稿模型大小",
    draftTokens: "每步草稿 token 数",
    specResult:
      "草稿模型额外占用约 {gb} GB 显存。在接受率约 60% 时，预计加速 {speedup}×。",
    mtpNoteStrong: "MTP（多 token 预测）：",
    mtpNote:
      " 基于模型原生 MTP 头的内置投机解码。无需单独的草稿模型——仅为 MTP 头增加约 0.3 GB 显存。兼容 DeepSeek V3 与 R1 系列。预计加速约 1.8×。",

    expertOffloading: "专家卸载",
    expertOffloadingDesc: "将部分专家保留在 GPU，其余卸载至 CPU",
    expertsOnGpu: "GPU 上的专家数",

    suggestionStrong: "💡 建议：",
    suggestionKeep: " 建议至少将 ",
    suggestionExperts: "{n} 个专家",
    suggestionOnGpu: " 保留在 GPU 上。",
    suggestionActiveMulti:
      " 你的模型每个 token 会激活 {active} 个专家，低于该数量将导致频繁的 PCIe 传输。",
    suggestionActiveOne:
      " 即便只有 1 个激活专家，保留约 15% 的专家在 GPU 上，也能在路由变化时提供负载均衡缓冲。",

    vramSavedStrong: "节省显存：",
    vramSaved: " 权重约节省 {gb} GB（专家 FFN 层约占总参数量的 70%）。",
    offloadedExperts: " 已卸载专家：{offloaded}/{total}",

    recommendedRangeStrong: "✅ 推荐区间：",
    recommendedRange:
      " GPU 上保留 {min}–{max} 个专家，可在显存节省与性能之间取得平衡。",
    keepingPct: " 当前保留 {pct}% 的专家在 GPU 上。",

    whyMattersStrong: "为何重要：",
    whyMatters:
      " 在 MoE 模型中，每个 token 只计算 {total} 个专家中的 {active} 个，但所有专家权重都必须加载进显存。将专家卸载到 CPU 可节省约 {gb} GB，但在访问被卸载的专家时会引入 PCIe 传输延迟。",
    warningThrashing:
      " ⚠️ 警告：GPU 上的专家数少于每 token 激活数（{active}）——将导致严重的 PCIe 抖动！",

    critical:
      "严重：GPU 上保留的专家数少于每 token 激活数（{active}），会导致频繁的 PCIe 传输，严重降低性能。请立即增加“GPU 上的专家数”。",
    allExpertsOnGpu:
      "所有专家均在 GPU 上——无需卸载。减少“GPU 上的专家数”可节省显存。",

    pagedEnabled:
      "已启用分页注意力：KV 缓存内存降低约 25%。这是 vLLM、SGLang 与 TensorRT-LLM 的默认设置。",

    tip: {
      gpuModel:
        "选择用于推理的 GPU。显存、内存带宽与 TFLOPS 会直接影响所有估算结果。",
      numGpus:
        "张量并行会将模型拆分到多张 GPU 上。更多 GPU 可增加总显存并提升吞吐，但会带来 GPU 间的通信开销。",
      weightQuant:
        "量化会降低每个权重的比特数。比特数越低 = 显存越少、解码越快（受内存带宽限制），但可能损失质量。BF16 是参考质量基线。",
      kvPrecision:
        "键值（KV）缓存精度。越低 = 每层每 token 占用的显存越少，从而支持更长上下文或更多并发用户，代价是轻微的质量下降。",
      contextWindow:
        "KV 缓存中保存的总 token 数（提示词 + 生成）。上下文越大，显存占用显著增加——近似线性增长。点击数值徽标可手动输入自定义大小。",
      promptLength:
        "用于估算首 token 时延（TTFT）的输入 token 数。预填充（prefill）受算力限制，随提示词长度增长。点击徽标可输入自定义值。",
      concurrentUsers:
        "同时进行的推理请求数（批大小）。每个用户会线性增加 KV 缓存显存。用户越多，单用户吞吐越低，但 GPU 利用率更高。点击徽标可输入最高 1024。",
      pagedAttention:
        "vLLM 风格的分页 KV 缓存。通过减少内存碎片约 20-40%，支持更长上下文与更多并发用户。是 vLLM、SGLang 与 TensorRT-LLM 的标准做法。",
      specDecoding:
        "使用小型草稿模型或 MTP 头一次预测多个 token，再由主模型并行校验。可将吞吐提升 1.5-3×。",
      draftModelSize:
        "草稿模型的参数量（十亿）。越小 = 草稿越快但接受率越低。对于 7B+ 主模型，常见选择为 0.5B-1.5B。",
      draftTokens:
        "草稿模型在校验前生成的 token 数。token 越多 = 潜在加速越高但接受率越低。典型值为 4-8 个。",
      expertOffloading:
        "将部分专家卸载到 CPU 内存，仅在显存中保留 N 个专家。可降低显存占用，但在访问已卸载专家时会引入 PCIe 延迟。适用于在有限显存上容纳大型 MoE 模型。",
      expertsOnGpu:
        "保留在显存中的专家数量，其余卸载到 CPU。为获得最佳性能，激活的专家应始终位于 GPU 上。",
    },
  },

  results: {
    fitFits: "显存充裕",
    fitTight: "显存偏紧（>85%）",
    fitOverflow: "显存不足",
    requiredAvailable: "需要 {req} / 可用 {avail}（{n}× {gpu}）",
    minGpusNeeded: "最少所需 GPU 数：",
    vramUtilization: "显存利用率",
    vramUtilizationValue: "占 {total} 的 {pct}%",

    legendWeights: "权重",
    legendKvCache: "KV 缓存",
    legendActivations: "激活值",
    legendDraft: "草稿模型",
    legendMtp: "MTP 头",
    pagedSuffix: "（分页）",

    totalVram: "总显存",
    timeToFirstToken: "首 token 时延",
    tokensPerSecond: "每秒 token 数",
    totalVramSub: "{quant} · {users}",
    ttftSub: "{prompt} 个提示词 token · {n}× GPU · {params}",
    ttftSubActive: "{active}B 激活参数",
    ttftSubParams: "{params}B 参数",
    tpsSub: "单用户 · 总计 {total} tok/s · 有效带宽 {bw} GB/s",

    overflowTitle: "显存不足（需要 {req}，可用 {avail}）：",
    overflowBody1: " 模型权重与 KV 缓存超出 GPU 显存。下方模拟器展示的是 ",
    overflowBodyStrong: "在严重 CPU 卸载惩罚下的估算吞吐",
    overflowBody2:
      " —— 有效带宽将从约 {hbm} GB/s（HBM）降至约 {pcie} GB/s（PCIe 换页）。",
    overflowBody3: "{n}×{gpu} 最多可容纳约 {max} GB。",
    overflowBodyStrong2:
      "建议：使用更多/更快的 GPU、缩短上下文长度，或改用更低的量化。",
    overflowBody4:
      " 尽管显存溢出，模拟仍按部分 CPU 卸载估算 token 速度——吞吐会明显低于显存充足的情形。",

    diffusionStrong: "扩散模型：",
    diffusionBody1:
      " {model} 采用基于扩散的文本生成方式，而非标准的自回归解码。这意味着首 token 时延（TTFT）显著更高（首 token 前需多次去噪迭代），但一旦去噪收敛，",
    diffusionBodyStrong: "整体 token 生成可能更快",
    diffusionBody2:
      "，因为每一步都能产出更高质量、需要更少重试的 token。模拟估算 TTFT 为 {ttft} 毫秒（去噪按 ×3 计），解码约 {tps} tok/s。",

    moeStrong: "MoE 计算说明：",
    moeTotalParams: "{params}B 总参数",
    moeActiveParams: "{active}B 激活参数",
    moeBody1: " 权重显存按 ",
    moeBody2: " 计算（所有专家均需加载）。TTFT 与 tok/s 按 ",
    moeBody3:
      " 计算（{active}/{total} 个专家，占权重的 {pct}%）。这使得 {model} 的推理速度显著快于同等总参数量的稠密模型。",

    optStrong: "已启用的推理优化：",
    optPaged: "分页注意力通过动态内存分配将 KV 缓存内存降低约 25%。",
    optSpecStandard1: "使用 {size}B 草稿模型的投机解码会额外占用 ",
    optSpecStandard2: " 显存，但视接受率可将吞吐提升 1.5-3×。",
    optSpecMtp1:
      "采用模型原生多 token 预测头的 MTP 投机解码。无需单独的草稿模型——仅需 ",
    optSpecMtp2: " 用于 MTP 头。预计吞吐提升约 1.8×。",
    optOffload1: "专家卸载已启用：{total} 个专家中有 {n} 个位于 GPU，其余卸载至 CPU。权重显存从 {full} 降至 ",
    optOffload2: "。",

    vramBreakdown: "显存拆分",
    bwModelWeights: "模型权重",
    bwKvCache: "KV 缓存",
    bwActivations: "激活值",
    bwDraft: "草稿模型（投机解码）",
    bwMtp: "MTP 头（投机解码）",
    total: "合计",

    bwWeightsSub: "{params}B 参数 × {bpw} bpw × {overhead}× 开销{extra}",
    bwWeightsMoEOnGpu: "（{n}/{total} 个专家在 GPU）",
    bwWeightsMoEAll: "（{n} 个专家，全部加载）",
    bwKvSub:
      "2 × {kvHeads} KV 头 × {headDim} 头维度 × {ctx} 上下文 × {layers} 层 × {users} × {bytes}B{paged}",
    bwKvPaged: "（约 25% 分页）",
    bwActivationsSub: "{users} × {ctx} 上下文 × {hidden} 隐藏维度 × 2B{extra}",
    bwActivationsMoE: " + MoE 路由开销",
    bwDraftSub: "{size}B 草稿模型 × {bpw} bpw",
    bwMtpSub: "多 token 预测头（约 0.3 GB，内置于模型）",

    tensorParallelStrong: "张量并行（{n}× GPU）：",
    tensorParallel1: " 权重分片到 {n} 张 GPU —— 每张持有 ",
    tensorParallel2: " 的权重。有效内存带宽：",
    tensorParallel3: " GB/s",
    tensorParallelNvlink: "（NVLink，85% 效率）",
    tensorParallelPcie: "（PCIe，65% 效率）",
    tensorParallel4: "。TTFT 使用 {n}× {tf} TF = ",
    tensorParallel5: " TF 有效算力。",

    concurrencyStrong: "并发（{n} 个用户）：",
    concurrency1: " 每个用户需要 {kvPerUser} GB 的 KV 缓存。KV 总量：",
    concurrency2: "。系统总吞吐：",
    concurrency3: "，由所有用户共享（单用户 {tps} tok/s）。",

    formulaReference: "公式参考",
    fWeightsTitle: "模型权重显存",
    fWeightsFormula1: "weights_GB = total_params × 10⁹ × (bits_per_weight / 8) × overhead / 1024³",
    fWeightsMoe: "[MoE] 全部 {n} 个专家权重都会加载进显存。",
    fWeightsExample: "示例：{params}B × {bpw} B × {overhead} ÷ 1024³",
    fWeightsResult: "       = {gb} GB",
    fWeightsExplMoE:
      "对于 MoE 模型，所有专家权重都必须同时驻留显存，即便每个 token 只激活 {total} 个中的 {active} 个。开销因子用于覆盖量化查找表、路由权重与框架缓冲。",
    fWeightsExplDense:
      "每个模型参数按量化决定的精度存储。开销因子用于覆盖量化查找表、框架缓冲与对齐填充。",

    fKvTitle: "KV 缓存显存",
    fKvFormula1: "kv_GB = 2 × kv_heads × head_dim × seq_len × layers × users × bytes_per_kv / 1024³",
    fKvHeadDim: "head_dim = hidden_dim / num_heads = {hidden} / {heads} = {headDim}",
    fKvMoe: "[MoE] KV 缓存仅取决于注意力层，与专家数量无关。",
    fKvExample: "kv_GB = 2 × {kvHeads} × {headDim} × {ctx} × {layers} × {users} × {bytes}",
    fKvResult: "     = {gb} GB",
    fKvExpl:
      "KV 缓存为每个 Transformer 层保存 Key 与 Value 张量。采用 GQA（{kvHeads} 个 KV 头 vs {heads} 个注意力头）时，缓存比 MHA 小 {factor}×。KV 缓存随上下文长度与并发用户数线性增长。对于 MoE 模型，注意力架构与专家路由相互独立。",

    fTtftTitle: "首 token 时延",
    fTtftTitleMoE: "首 token 时延（MoE）",
    fTtftMoe: "[MoE] FLOPs 使用激活参数量（{active}B），而非总参数量（{total}B）",
    fTtftFormula: "ttft = 2 × {p} × prompt_tokens / (tflops × 10¹² × gpus × eff)",
    fTtftActive: "激活参数量",
    fTtftParams: "参数量",
    fTtftPrefill: "预填充 FLOPs = 2 × {active}B × {prompt} = {gflop}G",
    fTtftEff: "有效 TFLOPS = {tf} × {n} × {tpEff} × {quantEff} = {eff} TF",
    fTtftResult: "TTFT = {s} s = {display}",
    fTtftExplMoE:
      "MoE 的关键点：TTFT 使用激活参数量（{active}B），而非总参数量（{total}B）。预填充时每个 token 只计算 {nTotal} 个专家中的 {nActive} 个。这正是 {model} 等 MoE 模型在总参数量很大的情况下仍能实现低 TTFT 的原因。",
    fTtftExplDense:
      "预填充受算力限制：所有提示词 token 并行处理。TTFT 随模型规模与提示词长度增长。更多 GPU 可通过张量并行降低 TTFT（NVLink 上约 80% 效率）。",

    fTpsTitle: "每秒 token 数",
    fTpsTitleMoE: "每秒 token 数（MoE）",
    fTpsMoe: "[MoE] 带宽使用激活参数量（{active}B）——仅流式加载激活的专家权重",
    fTpsFormula: "tps = eff_bandwidth / ({p} × bytes_per_weight / gpus) / users",
    fTpsActive: "激活参数量",
    fTpsParams: "参数量",
    fTpsEffBw: "有效带宽 = {bw} GB/s",
    fTpsBytes: "每 token 字节数 = {active}B × {bpw} B/权重 / {n} GPU = {gb} GB",
    fTpsRaw: "tps（原始） = {raw} tok/s",
    fTpsPerUser: "tps/用户  = {tps} tok/s",
    fTpsExplMoE:
      "MoE 的关键点：解码吞吐使用激活参数量（{active}B）。解码时，每个 token 仅从 HBM 流式加载 {nActive} 个激活专家。总参数量（{total}B）虽在显存中，但每一步并非全部读取，因此 MoE 模型相对同等稠密模型具有显著吞吐优势。",
    fTpsExplDense:
      "token 生成受内存带宽限制：模型权重会随每个 token 从显存流式加载。量化通过减少读取字节数直接提升吞吐。并发用户会共享带宽，但批处理可带来轻微的利用率提升。",

    keySensitivities: "关键敏感度",
    sensContextLabel: "上下文 ×2",
    sensContextImpact: "KV 缓存 → {total} GB（+{delta} GB）",
    sensUsersLabel: "用户 ×2",
    sensUsersImpact: "KV+激活 → {total} GB · 单用户 TPS ÷2 · 总 TPS 不变",
    sensQuantLabel: "Q4 vs BF16",
    sensQuantImpact: "权重：节省 {saved} · 解码快约 2.5×",
    sensMoeLabel: "MoE vs 稠密",
    sensMoeImpact: "相比稠密 {active}B 模型显存大 {factor}×，但算力速度相同",
  },

  compare: {
    provider: "厂商",
    tier: "层级",
    gpusPerNode: "每节点 GPU 数",
    comparingFor: "对比目标",
    comparingSub: "{quant} · {ctx}K 上下文 · {users}",
    moeActiveTotal: "{active}B 激活 / {total}B 总量",
    allProviders: "全部厂商",
    allTiers: "全部层级",
    tierConsumer: "消费级 / 游戏",
    tierProsumer: "专业 / 工作站",
    tierDatacenter: "数据中心 / 云",
    searchProvider: "搜索厂商...",
    searchTier: "搜索层级...",
    selectGpuCount: "选择 GPU 数量...",

    moeStrong: "MoE 显卡对比：",
    moeNote:
      " 显存需求基于总参数量（{params}B —— 所有专家都必须容纳）。TTFT 与 Tok/s 基于激活参数量（{active}B）。这正是 MoE 模型需要更多显存、但比同等规模的稠密模型运行更快的原因。",

    colGpu: "GPU",
    colMinGpus: "最少 GPU 数",
    colGpuVram: "单卡显存",
    colTtft: "TTFT",
    colTpsPerUser: "Tok/s（单用户）",
    colTotalTps: "总 Tok/s",
    colMemBw: "显存带宽",

    footerFit:
      "{total} 款 GPU 中有 {fits} 款可用 {n}× GPU 容纳该模型。变暗的行需要更多 GPU。",
    footerSort: "点击列标题可排序。奖杯图标 = 该类别最佳。",
  },

  sim: {
    title: "推理模拟",
    play: "播放",
    replay: "重播",
    stop: "停止",
    reset: "重置",
    ttftEst: "TTFT（估算）",
    tpsEst: "Tok/s（估算）",
    elapsed: "已用时间",
    generated: "已生成",
    pressPlay: "点击“播放”开始模拟推理",
    prefillInfo: "预填充：{ttft} 动画 · 解码：约 {tps} tok/s",
    capped: "（为展示而截断）",
    prefilling: "正在预填充 {n} 个提示词 token...",
    computeBound: "受算力限制的预填充过程 —— 并行处理所有提示词 token",
    cappedNote: "（模拟上限 4 秒；上方显示的是真实 TTFT）",
    ttftSimulated: "TTFT：模拟值 {v}",
    liveRate: "实时 {v} tok/s",
    outputComplete: "输出完成。",
    simComplete: "模拟完成 —— 共生成 {n} 个 token，解码耗时 {s} 秒",
    simCompleteUsers: "（{n} 个并发用户共享带宽）",
    samples: [
      "大语言模型部署时需要大量 GPU 显存。显存需求同时随参数数量和推理精度增长。对于 BF16 下的 70 亿参数模型，仅权重就需要约 14 GB 显存，这还没算上 KV 缓存、激活值和框架开销。量化通过以更低精度存储权重来减少占用。例如 Q4_K_M 每个权重使用 4.5 比特，相比 FP16 可将内存削减约 3.5 倍。这让原本需要多张 GPU 的模型能够在一张消费级显卡上运行。核心权衡在于模型质量与显存占用。更低精度的量化会向权重中引入更多噪声，可能降低推理、数学等复杂任务的质量；而对于文本补全或摘要等简单任务，激进量化通常也能以极小的质量损失良好工作。",
      "混合专家（MoE）架构提供了颇具吸引力的权衡：每个 token 只激活一部分专家，使 MoE 模型能够达到远大于自身规模的稠密模型的质量，同时把算力与内存带宽成本维持在激活参数量对应的水平。在一个共有 256 个专家、每 token 激活 8 个的 MoE 模型中，每次前向传播只计算约 3% 的总参数，但所有专家权重都必须常驻 GPU 显存。这就是为何拥有 6850 亿总参数的 DeepSeek V3 能达到接近 370 亿稠密模型的推理速度。MoE 模型的 KV 缓存同样与专家数量无关，因为它只取决于注意力层，而非前馈专家层。专家卸载还能进一步降低显存占用：只把频繁使用的专家留在 GPU，其余卸载到 CPU 内存。",
      "在生产环境部署大模型时，token 生成速率本质上受内存带宽限制。无论 GPU 张量核心多强，每个解码步骤都需要把完整的模型权重从 HBM 流式加载到计算单元。这意味着内存带宽通常是推理吞吐的首要瓶颈。对于激活参数量为 A、每参数量化占用 B 字节的模型，每生成一个 token 都需要从内存读取 A 乘 B 字节。在 1000 GB/s 的内存带宽下，一个 700 亿参数、4 比特量化的模型每秒约能生成 1000 除以 70 再乘 0.5 个 token，也就是约 28 tok/s。跨多张 GPU 使用张量并行可成比例提升有效带宽，但会引入通信开销。",
      "上下文窗口大小与注意力计算量之间是二次关系，但与 KV 缓存内存之间只是线性关系。128K 上下文窗口所需的 KV 缓存是 4K 窗口的 32 倍，这使得量化 KV 缓存成为长上下文部署的必备手段。KV 缓存为序列中每个 token 在全部注意力层保存 Key 与 Value 张量。采用分组查询注意力（用 8 个 KV 头替代 32 个查询头）时，KV 缓存比标准多头注意力小 4 倍。对于一个 80 层、处理 128K 上下文的 700 亿参数模型，仅 KV 缓存每个用户就可能超过 50 GB 显存。vLLM 等框架采用的分页注意力算法通过动态分配 KV 缓存块减少内存碎片，可节省约 20% 到 40% 的 KV 缓存内存。",
      "在 8 张 GPU 上使用张量并行时，对于受内存带宽限制的负载，推理吞吐接近线性提升；TTFT 则受益于合并后的 TFLOPS，不过在 GPU 数量较多时，GPU 间通信开销会成为瓶颈。每张 GPU 持有一部分模型权重分片，并计算每个 Transformer 层中属于自己的部分。在前向过程中，GPU 必须通过 NVLink 或 Infinity Fabric 通信，以同步注意力输出与前馈网络结果。通信开销随模型维度与序列长度增长，在 GPU 数量很大时甚至可能占据主导。为达到最佳效率，模型应足够大以摊薄通信成本。一条经验法则是：每张 GPU 至少应承载 50 亿到 100 亿参数规模的分片权重。",
      "投机解码是一种加速文本生成的技术：用小草稿模型一次预测多个 token，再由主模型并行校验。其可行之处在于草稿模型因体积小、运行快得多，而主模型的校验过程能够同时处理多个 token。典型加速为 1.5 到 3 倍，取决于草稿模型大小、草稿 token 的接受率以及每步草稿 token 数量。多 token 预测（MTP）进一步把投机头直接内置到主模型中，免去了单独的草稿模型。DeepSeek V3 与 R1 系列原生支持 MTP，仅以极小的额外显存（用于预测头）即可获得约 1.8 倍的吞吐提升。",
    ],
  },

  accuracy: {
    title: "量化精度影响",
    qatBadge: "QAT 优化系列",
    summaryStrong: "预估 MMLU-Pro 分数下降",
    summarySuffix: " 相对 BF16 基线。",
    summaryQat1: " ",
    summaryQat2:
      " 采用量化感知训练（QAT）训练，在 Q4 下相比标准训练后量化（PTQ）可多保留约 70% 的精度。典型 PTQ 的 Q4_K_M 会损失约 5-6 分，而 QAT 版本仅损失约 2 分。",
    summaryDense1: "较大的模型（{params}B）比小模型更能耐受量化。",
    summaryDenseMoe: " MoE 变体：{active}B 激活参数。",
    baseline: "基线",
    pts: "{delta} 分",
    legendLeft: "越靠左 = 精度越低",
    legendBar: "条宽 ∝ 精度损失",
    legendWeights1: "权重：",
    legendWeights2: "（BF16）",
    showDetails: "显示",
    hideDetails: "隐藏",
    detailsSuffix: " 详细精度说明",
    currentSelected: "当前选择：",
    currentEstimated: "——预估 ",
    currentNoLoss: "无精度损失",
    currentDrop: "下降 {delta} 分",
    currentSuffix: "（MMLU-Pro，相对 BF16 基线）。",
    currentSaves: "· 权重显存节省 {gb} GB",
  },

  share: {
    button: "分享配置",
    title: "分享配置",
    description:
      "复制此链接即可与他人分享你当前的配置。链接中包含你的全部设置（GPU、模型、量化、上下文长度等）。",
    gpu: "GPU：",
    model: "模型：",
    quantization: "量化：",
    context: "上下文：",
    users: "用户：",
    estVram: "预估显存：",
    shareableUrl: "分享链接",
    openInNewTab: "在新标签页打开",
    copyUrl: "复制链接",
    copied: "已复制！",
    toastSuccess: "配置链接已复制到剪贴板！",
    toastError: "复制链接失败，请重试。",
  },

  select: {
    defaultPlaceholder: "请选择...",
    defaultSearch: "搜索...",
    noResults: "未找到与“{q}”匹配的结果",
    resultCount: "{n} 条结果",
    resultCountFor: "（“{q}”）",
    typeValue: "点击输入数值",
  },

  tier: {
    consumer: "消费级",
    prosumer: "专业级",
    datacenter: "数据中心",
  },

  quant: {
    fp32: { qualityNote: "参考级质量，显存占用极高" },
    bf16: { qualityNote: "近乎无损——标准的训练与推理数据类型" },
    fp16: { qualityNote: "近乎无损；体积与 BF16 相同，范围略低" },
    fp8_e4m3: { qualityNote: "质量损失极小；在 H100/H200/B200 上支持" },
    q8_0: { qualityNote: "质量损失极小，相比 BF16 约节省一半内存" },
    q6_k: { qualityNote: "质量损失很低，内存效率良好" },
    q5_k_m: { qualityNote: "质量与内存效率均衡" },
    q5_k_s: { qualityNote: "比 Q5_K_M 略小，质量轻微下降" },
    q4_k_m: { qualityNote: "热门选择；质量略降，内存大幅节省" },
    q4_k_s: { qualityNote: "Q4_K_M 的略小变体" },
    q4_0: { qualityNote: "质量损失较多，内存效率很高" },
    iq4_xs: { qualityNote: "iQuant 4 比特；同体积下质量优于 Q4_0" },
    q3_k_m: { qualityNote: "质量损失明显；仅适用于资源受限场景" },
    q3_k_s: { qualityNote: "相比 K_M 变体质量进一步下降" },
    q2_k: { qualityNote: "质量损失显著——显存占用最低" },
    iq1_m: { qualityNote: "质量很差——实验性，仅适用于超大模型" },
    int8: { qualityNote: "质量良好，需要 CUDA；常配合 bitsandbytes 使用" },
    nf4: { qualityNote: "4 比特 NormalFloat；用于 QLoRA 微调与推理" },
    awq: { qualityNote: "激活感知量化；质量/速度权衡出色" },
    awq_2: { qualityNote: "激进的 2 比特 AWQ；质量损失显著" },
    gptq4: { qualityNote: "训练后量化；在 HuggingFace 上广泛使用" },
    gptq8: { qualityNote: "高质量 GPTQ；精度损失极小" },
    gguf_f16: { qualityNote: "GGUF 格式的全精度，用于 llama.cpp / Ollama" },
  },

  kv: {
    fp32: { qualityNote: "最高精度，实际中很少需要" },
    fp16: { qualityNote: "标准默认；无可测量的质量损失" },
    fp8: { qualityNote: "质量影响极小；相比 FP16 约节省一半 KV 内存" },
    int8: { qualityNote: "质量轻微下降；内存/精度权衡良好" },
    int4: { qualityNote: "质量影响明显；最大压缩率" },
  },

  modelNotes: {
    llama4_scout: "16 个专家，激活 1 个，10M 上下文",
    llama4_maverick: "128 个专家，激活 1 个",
    mixtral_8x7b: "8 个专家，每 token 激活 2 个",
    mixtral_8x22b: "8 个专家，每 token 激活 2 个",
    qwen3_30b_moe: "128 个专家，激活 8 个",
    qwen3_235b_moe: "128 个专家，激活 8 个",
    gemma4_31b: "稠密；256K 上下文；文本+图像多模态；提供 QAT",
    gemma4_26b_a4b: "128 个专家，路由激活 3 个；256K 上下文；提供 QAT",
    gemma4_12b:
      "QAT 优化；首个带原生音频的中等规模 Gemma；可在 16GB 显存运行；性能接近 26B",
    gemma4_4b: "QAT 优化；逐层嵌入；面向边缘优化；可在树莓派 5 上运行",
    gemma4_e2b: "QAT 优化；最小的 Gemma 4；逐层嵌入；端侧运行",
    diffusiongemma_26b_a4b:
      "64 个专家，激活 4 个；基于扩散的文本生成（并行块去噪，非自回归）",
    qwen36_27b:
      "稠密；混合 Gated DeltaNet；原生 262K，可扩展 1M；支持 MTP；旗舰编码模型",
    qwen36_35b_a3b:
      "256 个专家，路由激活 8 个 + 1 个共享；智能体编码；编码能力超越 Gemma 4-31B",
    glm5_744b:
      "GlmMoeDSA 架构；256 个专家，激活 8 个；200K 上下文；MIT 许可；SWE-bench 77.8%；AIME 92.7%",
    phi4_moe: "16 个专家，激活 2 个",
    deepseek_v2: "MLA 注意力 + 160 个专家，激活 6 个",
    deepseek_v3: "MLA + 256 个专家，激活 8 个",
    deepseek_r1: "与 V3 同架构 + 强化学习推理",
    devstral: "面向代码的 Mistral Small 变体",
    llama31_8b: "指令微调变体",
    deepseek_r1_0528: "2025 年 5 月更新的 R1 检查点",
    deepseek_v2_5: "合并了对话与代码的 V2 检查点",
    deepseek_prover_v2: "数学/定理证明",
    gemma3n_e2b: "高效的移动级模型",
    gemma3n_e4b: "高效的端侧模型",
    command_a: "256K 上下文，8 个专家中激活 2 个",
    granite_moe_3b: "32 个专家，激活 8 个",
    bakllava_7b: "多模态（此处仅展示文本；视觉编码器额外约 300 MB）",
    nomic_embed: "嵌入模型，非生成式",
    qwen35_0_8b: "稠密；混合线性+全注意力；统一 VLM",
    qwen35_2b: "稠密；混合线性+全注意力；统一 VLM",
    qwen35_4b: "稠密；混合线性+全注意力；统一 VLM",
    qwen35_9b: "稠密；混合线性+全注意力；统一 VLM",
    qwen35_27b: "稠密；混合线性+全注意力；统一 VLM",
    qwen35_35b_a3b: "256 个专家，路由激活 8 个 + 1 个共享；moe_intermediate_size=512",
    qwen35_122b_a10b: "256 个专家，路由激活 8 个 + 1 个共享；moe_intermediate_size=1024",
    qwen35_397b_a17b: "512 个专家，路由激活 10 个 + 1 个共享；旗舰多模态 MoE",
    glm4_9b: "GQA；支持工具调用与视觉变体",
    glm4_9b_long: "通过 LongWriter 支持 2M token 上下文",
    glm4_32b: "稠密，开放权重",
    glm4_plus_9b: "相比 GLM-4 9B 改进了指令遵循",
    glmz1_9b: "推理 / 沉思模型；扩展思考预算",
    glmz1_32b: "推理模型；AIME 2025 开源最高分",
    glmz1_32b_moe: "稀疏 96B 总量，32B 激活；8 个专家，激活 3 个",
    glm5: "256 个路由 + 1 个共享专家，激活 8+1；DSA 注意力；智能体工程",
    glm5_1:
      "256 个路由 + 1 个共享，激活 8+1；GlmMoeDSA；202K 上下文，131K 输出；SWE-Bench Pro 58.4",
    glm5_2: "索引共享 MoE；1M 上下文，131K 输出；MTP 头；高/最高思考强度",
    kimi_k2: "384 个专家，激活 8 个；MLA；128K 上下文；MuonClip 优化器",
    kimi_k2_thinking: "384 个专家，激活 8 个；MLA；256K 上下文；原生 INT4 量化",
    kimi_k2_5: "多模态（文本+图像+视频）；MoonViT；100 智能体集群；INT4 预量化",
    hy3: "192 个路由 + 1 个共享专家，激活 8 个；首层稠密；MTP 层；Apache 2.0",
    hy3_fp8:
      "FP8 量化变体；FP8 下约 129.6GB 显存；192 个路由 + 1 个共享专家，激活 8 个",
    kimi_k2_6:
      "384 个专家，激活 8 个；MLA；256K 上下文；300 智能体集群；修改版 MIT 许可",
    kimi_k3: "2088 个专家，激活 16 个；混合线性+全注意力；256K 上下文；多模态",
    deepseek_v4: "256 个专家，激活 6 个；CSA+HCA 混合注意力；原生 FP8；1M 上下文",
    nemotron_9b: "Mamba2-Transformer 混合；128K 上下文；可与 Llama-3.2-11B 竞争",
    qwen25_coder_0_5b: "代码专用 Qwen2.5；原生 32K，经 YaRN 达 128K；支持 FIM",
    qwen25_coder_1_5b: "代码专用 Qwen2.5；原生 32K，经 YaRN 达 128K；支持 FIM",
    qwen25_coder_3b: "代码专用 Qwen2.5；原生 32K，经 YaRN 达 128K；支持 FIM",
    qwen25_coder_7b: "代码专用 Qwen2.5；6.53B 非嵌入参数；经 YaRN 达 128K",
    qwen25_coder_14b: "代码专用 Qwen2.5；经 YaRN 达 128K",
    qwen25_coder_32b: "开源 SOTA 代码模型；编码能力媲美 GPT-4o；经 YaRN 达 128K",
  },

  // Flat map for arbitrary strings embedded in data (e.g. accuracy-chart notes).
  // Looked up via tc(); falls back to the original English text when absent.
  content: {
    Baseline: "基线",
    "Near-lossless": "近乎无损",
    "Minimal loss": "损失极小",
    "QAT-optimized — ~2 pt vs ~5 pt PTQ": "QAT 优化——约 2 分 vs PTQ 约 5 分",
    "QAT-optimized": "QAT 优化",
    "PTQ only — QAT uses Q4_K_M": "仅 PTQ——QAT 使用 Q4_K_M",
    "MoE 744B — larger models tolerate quantization better":
      "744B MoE——大模型更能耐受量化",
    "MoE 754B — larger models tolerate quantization better":
      "754B MoE——大模型更能耐受量化",
    "753B MoE — same family as GLM-5/5.1": "753B MoE——与 GLM-5/5.1 同系列",
    "35B-A3B MoE — 3B active params": "35B-A3B MoE——3B 激活参数",
    "QAT-optimized — ~2.5 pt vs ~5.5 pt PTQ": "QAT 优化——约 2.5 分 vs PTQ 约 5.5 分",
    "PTQ only": "仅 PTQ",
    "Popular sweet spot": "热门平衡点",
    "Popular sweet spot for coding tasks": "编码任务的热门平衡点",
    "480B MoE — very tolerant at Q4": "480B MoE——在 Q4 下非常耐受",
    "Flagship dense — strong at Q4": "旗舰稠密——在 Q4 下表现强劲",
  },
};

export const translations: Record<Locale, Dictionary> = { en, zh };