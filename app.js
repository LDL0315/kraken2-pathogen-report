const RANK_LABELS = {
  U: "unclassified",
  R: "root",
  D: "domain",
  K: "kingdom",
  P: "phylum",
  C: "class",
  O: "order",
  F: "family",
  G: "genus",
  S: "species",
};

// PATHOGEN_DB: exact-match entries (species/subspecies/isolate/biotype) + clade-level entries (genus/family)
// Populated from pathogen-db.js (window.SHENZHEN_PATHOGENS) and localStorage custom entries.
const PATHOGEN_DB = new Map();

// PATHOGEN_CLADE_TAXIDS: taxids at genus/family/species group level.
// Any descendant species under these taxa is considered a pathogen hit.
const PATHOGEN_CLADE_TAXIDS = typeof window !== "undefined" && window.PATHOGEN_CLADE_TAXIDS instanceof Set
  ? window.PATHOGEN_CLADE_TAXIDS
  : new Set();

// QUARANTINE_TAXIDS: 检疫传染病 (国境卫生检疫法 2025) — force highest priority
const QUARANTINE_TAXIDS = typeof window !== "undefined" && window.QUARANTINE_TAXIDS instanceof Set
  ? window.QUARANTINE_TAXIDS
  : new Set();

// MONITORING_TAXIDS: 监测传染病 (国境卫生检疫法 2025) — force highest priority
const MONITORING_TAXIDS = typeof window !== "undefined" && window.MONITORING_TAXIDS instanceof Set
  ? window.MONITORING_TAXIDS
  : new Set();

const EXCLUSION_PATTERNS = [
  /\bhomo sapiens\b/i,
  /\bsynthetic construct\b/i,
  /\bartificial sequences\b/i,
  /\buncultured\b/i,
  /\benvironmental samples\b/i,
  /\bother sequences\b/i,
];

const CUSTOM_PATHOGEN_STORAGE_KEY = "kraken2-pathogen-custom-db-v1";
const SHENZHEN_PATHOGENS = typeof window !== "undefined" && Array.isArray(window.SHENZHEN_PATHOGENS) ? window.SHENZHEN_PATHOGENS : [];
SHENZHEN_PATHOGENS.forEach(applyPathogenRecord);
readCustomPathogens().forEach(applyPathogenRecord);

function applyPathogenRecord(item) {
  if (!item?.taxid) return;
  const matchRank = item.matchRank || "exact";
  PATHOGEN_DB.set(String(item.taxid), {
    type: item.type || "待分类",
    severity: item.severity || "medium",
    zh: item.zh || item.ncbiName || item.englishName || "",
    note: item.note || "来自人间传染病名录。",
    englishName: item.englishName || "",
    ncbiName: item.ncbiName || "",
    ncbiRank: item.ncbiRank || "",
    hazardClass: item.hazardClass || "",
    matchRank,
    biosafetyLevel: item.biosafetyLevel || "",
    syndrome: item.syndrome || "",
    disease: item.disease || "",
    transmission: item.transmission || "",
    sample: item.sample || "",
    taxonomy: item.taxonomy || {},
    quarantineList: item.quarantineList || "",
    quarantineDisease: item.quarantineDisease || "",
  });
}

function readCustomPathogens() {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_PATHOGEN_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const state = {
  samples: [],
  mode: "single",
  selectedSample: 0,
  metric: "percent",
  minDirect: 1,
  topN: 20,
  hideBackground: true,
  treeQuery: "",
  sampleType: "clinical",
};

const els = {
  fileInput: document.querySelector("#reportFiles"),
  dropzone: document.querySelector(".dropzone"),
  emptyState: document.querySelector("#emptyState"),
  singleView: document.querySelector("#singleView"),
  multiView: document.querySelector("#multiView"),
  sampleSelect: document.querySelector("#sampleSelect"),
  singleTitle: document.querySelector("#singleTitle"),
  summaryCards: document.querySelector("#summaryCards"),
  interpretationText: document.querySelector("#interpretationText"),
  pathogenTable: document.querySelector("#pathogenTable"),
  pathogenCount: document.querySelector("#pathogenCount"),
  domainChart: document.querySelector("#domainChart"),
  treeSearch: document.querySelector("#treeSearch"),
  treeTable: document.querySelector("#treeTable"),
  exportSingle: document.querySelector("#exportSingle"),
  exportMulti: document.querySelector("#exportMulti"),
  exportMatrixCsv: document.querySelector("#exportMatrixCsv"),
  metric: document.querySelector("#metric"),
  minDirect: document.querySelector("#minDirect"),
  topN: document.querySelector("#topN"),
  hideBackground: document.querySelector("#hideBackground"),
  sampleType: document.querySelector("#sampleType"),
  multiSampleCount: document.querySelector("#multiSampleCount"),
  sampleOverview: document.querySelector("#sampleOverview"),
  matrix: document.querySelector("#matrix"),
  matrixMetric: document.querySelector("#matrixMetric"),
};

const helpTooltip = document.createElement("div");
helpTooltip.className = "floating-tip";
document.body?.appendChild(helpTooltip);

document.addEventListener?.("mouseover", (event) => {
  const target = event.target.closest?.(".help");
  if (!target) return;
  helpTooltip.textContent = target.dataset.tip ?? "";
  helpTooltip.classList.add("visible");
  positionHelpTooltip(target);
});

document.addEventListener?.("mousemove", (event) => {
  const target = event.target.closest?.(".help");
  if (!target) return;
  positionHelpTooltip(target);
});

document.addEventListener?.("mouseout", (event) => {
  if (!event.target.closest?.(".help")) return;
  helpTooltip.classList.remove("visible");
});

document.addEventListener?.("focusin", (event) => {
  const target = event.target.closest?.(".help");
  if (!target) return;
  helpTooltip.textContent = target.dataset.tip ?? "";
  helpTooltip.classList.add("visible");
  positionHelpTooltip(target);
});

document.addEventListener?.("focusout", (event) => {
  if (!event.target.closest?.(".help")) return;
  helpTooltip.classList.remove("visible");
});

document.querySelectorAll(".mode-btn").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll(".mode-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-selected", item === button ? "true" : "false");
    });
    render();
  });
});

els.fileInput.addEventListener("change", async (event) => {
  await loadFiles([...event.target.files]);
});

["dragenter", "dragover"].forEach((eventName) => {
  els.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropzone.classList.remove("dragging");
  });
});

els.dropzone.addEventListener("drop", async (event) => {
  await loadFiles([...event.dataTransfer.files]);
});

els.sampleSelect.addEventListener("change", (event) => {
  state.selectedSample = Number(event.target.value);
  render();
});

els.metric.addEventListener("change", (event) => {
  state.metric = event.target.value;
  render();
});

els.minDirect.addEventListener("input", (event) => {
  state.minDirect = Number(event.target.value || 0);
  render();
});

els.topN.addEventListener("input", (event) => {
  state.topN = Number(event.target.value || 20);
  render();
});

els.hideBackground.addEventListener("change", (event) => {
  state.hideBackground = event.target.checked;
  render();
});

els.sampleType.addEventListener("change", (event) => {
  state.sampleType = event.target.value;
  annotateSamples();
  render();
});

els.treeSearch.addEventListener("input", (event) => {
  state.treeQuery = event.target.value.trim().toLowerCase();
  renderTree();
});

els.exportSingle.addEventListener("click", () => {
  const sample = state.samples[state.selectedSample];
  if (!sample) return;
  downloadText(`${safeFileName(shortName(sample.fileName))}-pathogen-report.html`, buildSingleReportHtml(sample), "text/html;charset=utf-8");
});

els.exportMulti.addEventListener("click", () => {
  if (!state.samples.length) return;
  downloadText(`kraken2-pathogen-comparison-${dateStamp()}.html`, buildMultiReportHtml(), "text/html;charset=utf-8");
});

els.exportMatrixCsv.addEventListener("click", () => {
  if (!state.samples.length) return;
  downloadText(`kraken2-pathogen-matrix-${dateStamp()}.csv`, buildMatrixCsv(), "text/csv;charset=utf-8");
});

async function loadFiles(files) {
  const reportFiles = files.filter((file) => file.size > 0);
  if (!reportFiles.length) return;

  const parsed = [];
  for (const file of reportFiles) {
    const text = await file.text();
    const sample = parseReport(text, file.name);
    parsed.push(sample);
  }

  state.samples = parsed;
  state.selectedSample = 0;
  annotateSamples();
  render();
}

function parseReport(text, fileName) {
  const rows = [];
  const stack = [];
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
  let hasMinimizers = false;

  lines.forEach((line, index) => {
    const parts = line.split("\t");
    if (parts.length < 6) return;
    const isMinimizerReport = parts.length >= 8;
    hasMinimizers = hasMinimizers || isMinimizerReport;
    const offset = isMinimizerReport ? 2 : 0;
    const rawName = parts[5 + offset] ?? "";
    const leadingSpaces = rawName.match(/^ */)?.[0].length ?? 0;
    const depth = Math.floor(leadingSpaces / 2);
    const rank = clean(parts[3 + offset]);
    const rankRoot = rank.charAt(0);
    const row = {
      id: index,
      percent: toNumber(parts[0]),
      cladeReads: toInt(parts[1]),
      directReads: toInt(parts[2]),
      distinctMinimizers: isMinimizerReport ? toInt(parts[3]) : null,
      totalMinimizers: isMinimizerReport ? toInt(parts[4]) : null,
      rank,
      rankLabel: RANK_LABELS[rankRoot] ?? rank,
      taxid: clean(parts[4 + offset]),
      name: rawName.trim(),
      depth,
      parentId: null,
      children: [],
    };

    while (stack.length && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    if (stack.length) {
      row.parentId = stack[stack.length - 1].id;
      stack[stack.length - 1].children.push(row.id);
    }
    stack.push(row);
    rows.push(row);
  });

  const byTaxid = new Map(rows.map((row) => [row.taxid, row]));
  const root = rows.find((row) => row.taxid === "1") ?? rows.find((row) => row.rank === "R") ?? null;
  const unclassified = rows.find((row) => row.rank === "U" || row.taxid === "0") ?? null;
  const classifiedReads = root?.cladeReads ?? 0;
  const unclassifiedReads = unclassified?.cladeReads ?? 0;
  const totalReads = classifiedReads + unclassifiedReads;

  return {
    fileName,
    rows,
    byTaxid,
    hasMinimizers,
    root,
    unclassified,
    totalReads,
    classifiedReads,
    pathogenHits: [],
  };
}

function annotateSamples() {
  state.samples.forEach((sample) => {
    sample.pathogenHits = sample.rows
      .filter((row) => row.rank.startsWith("S") || shouldConsiderHigherRank(row))
      .map((row) => annotatePathogen(row, sample))
      .filter(Boolean)
      .sort(comparePathogenHits);
  });
}

function comparePathogenHits(a, b) {
  return pathogenTypePriority(a.type) - pathogenTypePriority(b.type)
    || b.score - a.score
    || b.row.directReads - a.row.directReads;
}

function pathogenTypePriority(type) {
  if (/寄生虫|原虫|蠕虫/.test(type)) return 0;
  if (/病毒/.test(type)) return 1;
  if (/细菌/.test(type)) return 2;
  return 3;
}

function shouldConsiderHigherRank(row) {
  // Check if this genus/family row's TaxID is in the clade-level pathogen set
  return ["G", "F"].includes(row.rank.charAt(0)) && PATHOGEN_CLADE_TAXIDS.has(row.taxid);
}

function annotatePathogen(row, sample) {
  // Step 1: exact TaxID match
  let db = PATHOGEN_DB.get(row.taxid);
  let matchSource = null;

  // Step 2: if no exact match and row is at species level, walk up ancestors
  // to find a clade-level pathogen (genus/family/species group)
  if (!db && row.rank.startsWith("S")) {
    const ancestorDb = findCladePathogenAncestor(row, sample);
    if (ancestorDb) {
      db = ancestorDb;
      matchSource = "clade-ancestor";
    }
  }

  const excluded = EXCLUSION_PATTERNS.some((item) => item.test(row.name));
  if (!db) return null;
  if (excluded && matchSource !== "clade-ancestor") return null;

  // Check quarantine/monitoring status — force highest priority
  const isQuarantine = db.quarantineList === "quarantine" || QUARANTINE_TAXIDS.has(row.taxid);
  const isMonitoring = db.quarantineList === "monitoring" || MONITORING_TAXIDS.has(row.taxid);

  const type = db.type || "待分类";
  // Quarantine/monitoring pathogens are always treated as highest severity
  const severity = (isQuarantine || isMonitoring) ? "high" : (db.severity || "medium");
  const isCladeMatch = matchSource === "clade-ancestor" || db.matchRank === "clade";

  let score = 0;
  // Base score from pathogen database
  score += severity === "high" ? 34 : severity === "medium" ? 26 : 18;

  // Quarantine/monitoring pathogens get maximum base score boost
  if (isQuarantine) score += 30;
  else if (isMonitoring) score += 20;

  // Clade-level match gets slightly lower base: species identification is less specific
  if (isCladeMatch && !row.rank.startsWith("S")) {
    score -= 6; // genus/family level match: less specific
  }

  score += Math.min(28, Math.log10(row.cladeReads + 1) * 9);
  score += Math.min(28, Math.log10(row.directReads + 1) * 10);
  score += row.rank === "S" ? 10 : row.rank.startsWith("S") ? 8 : 0;

  // When matching via clade ancestor, the species-level precision adds value
  if (matchSource === "clade-ancestor" && row.rank.startsWith("S")) {
    score += 4; // species ID under pathogenic genus is valuable
  }

  if (row.distinctMinimizers !== null) {
    score += Math.min(12, Math.log10(row.distinctMinimizers + 1) * 3.2);
  }
  if (excluded) score -= 42;
  if (row.directReads < state.minDirect && severity !== "high") score -= 18;
  if (isLikelyCommensal(row.name, state.sampleType)) score -= 10;
  score = clamp(Math.round(score), 0, 100);

  const status = classifyStatus(score, row, severity, true, excluded, isQuarantine, isMonitoring);
  if (status.key === "background" && !isQuarantine && !isMonitoring && !isCladeMatch) return null;

  // Build note for clade-ancestor matches
  let note = db.note || "";
  if (matchSource === "clade-ancestor") {
    const ancestorName = db.zh ? `${db.ncbiName} (${db.zh})` : db.ncbiName;
    note = (I18N.lang === "zh"
      ? `属级病原体（${ancestorName}）下的物种命中。`
      : `Species hit under genus-level pathogen (${ancestorName}).`) + (note ? " " + note : "");
  }

  // Add quarantine/monitoring disease annotation
  if (isQuarantine) {
    const qLabel = I18N.lang === "zh"
      ? `【检疫传染病】${db.quarantineDisease || ""}（依据《国境卫生检疫法》2025年施行目录）`
      : `[Quarantine Infectious Disease] ${db.quarantineDisease || ""} (per Frontier Health Quarantine Law, effective 2025)`;
    note = qLabel + (note ? " " + note : "");
  } else if (isMonitoring) {
    const mLabel = I18N.lang === "zh"
      ? `【监测传染病】${db.quarantineDisease || ""}（依据《国境卫生检疫法》2025年施行目录）`
      : `[Monitoring Infectious Disease] ${db.quarantineDisease || ""} (per Frontier Health Quarantine Law, effective 2025)`;
    note = mLabel + (note ? " " + note : "");
  }

  return {
    row,
    type,
    severity,
    score,
    status,
    zh: matchSource === "clade-ancestor" ? "" : (db.zh || ""),
    note,
    quarantineList: isQuarantine ? "quarantine" : (isMonitoring ? "monitoring" : ""),
    quarantineDisease: db.quarantineDisease || "",
  };
}

function findCladePathogenAncestor(row, sample) {
  let current = row;
  while (current?.parentId !== null && current?.parentId !== undefined) {
    // Check if the ancestor itself is in the clade pathogen set
    if (PATHOGEN_CLADE_TAXIDS.has(current.taxid)) {
      return PATHOGEN_DB.get(current.taxid) || null;
    }
    current = sample?.rows[current.parentId];
  }
  return null;
}

function classifyStatus(score, row, severity, inDb, excluded, isQuarantine, isMonitoring) {
  // Quarantine/monitoring infectious diseases: always highest priority
  if (isQuarantine || isMonitoring) {
    return { key: "critical", label: I18N.t("status.critical") };
  }
  if (excluded || score < 25 || row.directReads < state.minDirect) {
    return { key: "background", label: I18N.t("status.background") };
  }
  if (row.directReads < 5 && severity !== "high") {
    return { key: "trace", label: I18N.t("status.trace") };
  }
  if (severity === "low" && score < 90) {
    return score >= 50 ? { key: "review", label: I18N.t("status.review") } : { key: "trace", label: I18N.t("status.trace") };
  }
  if (score >= 72 || (inDb && severity === "high" && row.directReads >= 20)) {
    return { key: "critical", label: I18N.t("status.critical") };
  }
  if (score >= 50 || (inDb && row.directReads >= 10)) {
    return { key: "review", label: I18N.t("status.review") };
  }
  return { key: "trace", label: I18N.t("status.trace") };
}

function isLikelyCommensal(name, sampleType) {
  if (sampleType === "stool") return false;
  return /\bprevotella\b|\bphascolarctobacterium\b|\bsolobacterium\b|\bsutterella\b|\banaerococcus\b/i.test(name);
}

function render() {
  const hasSamples = state.samples.length > 0;
  els.emptyState.classList.toggle("hidden", hasSamples);
  els.singleView.classList.toggle("active", hasSamples && state.mode === "single");
  els.multiView.classList.toggle("active", hasSamples && state.mode === "multi");

  if (!hasSamples) return;
  renderSampleSelect();
  renderSingle();
  renderMulti();
}

function renderSampleSelect() {
  els.sampleSelect.innerHTML = state.samples
    .map((sample, index) => `<option value="${index}" ${index === state.selectedSample ? "selected" : ""}>${escapeHtml(sample.fileName)}</option>`)
    .join("");
}

function renderSingle() {
  const sample = state.samples[state.selectedSample];
  const visibleHits = getVisibleHits(sample);
  els.singleTitle.textContent = sample.fileName;
  els.pathogenCount.textContent = `${visibleHits.length} ${I18N.t("count.items")}`;

  const critical = sample.pathogenHits.filter((hit) => hit.status.key === "critical").length;
  const review = sample.pathogenHits.filter((hit) => hit.status.key === "review").length;
  const trace = sample.pathogenHits.filter((hit) => hit.status.key === "trace").length;
  const classifiedPct = sample.totalReads ? (sample.classifiedReads / sample.totalReads) * 100 : 0;

  els.summaryCards.innerHTML = [
    summaryCard(I18N.t("summary.critical"), critical, I18N.t("summary.criticalHint")),
    summaryCard(I18N.t("summary.review"), review, I18N.t("summary.reviewHint")),
    summaryCard(I18N.t("summary.trace"), trace, I18N.t("summary.traceHint")),
    summaryCard(I18N.t("summary.classified"), formatPct(classifiedPct), `${formatInt(sample.classifiedReads)} / ${formatInt(sample.totalReads)}`),
  ].join("");

  els.interpretationText.textContent = makeInterpretation(sample);
  renderPathogenTable(visibleHits);
  renderDomainChart(sample);
  renderTree();
}

function getVisibleHits(sample) {
  const hits = sample.pathogenHits
    .filter((hit) => hit.row.directReads >= state.minDirect)
    .filter((hit) => !state.hideBackground || hit.status.key !== "background");
  return suppressAncestorHits(hits, sample).slice(0, Math.max(1, state.topN));
}

function suppressAncestorHits(hits, sample) {
  const specificHits = hits.filter((hit) => hit.row.rank.startsWith("S") && hit.status.key !== "background");
  return hits.filter((hit) => {
    const rankRoot = hit.row.rank.charAt(0);
    if (!["G", "F"].includes(rankRoot)) return true;
    const hasSpecificDescendant = specificHits.some((specific) => isDescendantOf(specific.row, hit.row, sample));
    return !hasSpecificDescendant;
  });
}

function isDescendantOf(row, possibleAncestor, sample) {
  let current = row;
  while (current?.parentId !== null && current?.parentId !== undefined) {
    if (current.parentId === possibleAncestor.id) return true;
    current = sample?.rows[current.parentId];
  }
  return false;
}

function makeInterpretation(sample) {
  const critical = sample.pathogenHits.filter((hit) => hit.status.key === "critical");
  const review = sample.pathogenHits.filter((hit) => hit.status.key === "review");
  const trace = sample.pathogenHits.filter((hit) => hit.status.key === "trace");
  const names = critical.slice(0, 3).map((hit) => displayName(hit)).join(I18N.lang === "zh" ? "、" : ", ");
  if (critical.length) {
    return I18N.t("interp.critical", { n: critical.length, names });
  }
  if (review.length) {
    return I18N.t("interp.review", { n: review.length });
  }
  if (trace.length) {
    return I18N.t("interp.trace", { n: trace.length });
  }
  return I18N.t("interp.none");
}

function renderPathogenTable(hits) {
  if (!hits.length) {
    els.pathogenTable.innerHTML = `<tr><td colspan="8" class="muted">${escapeHtml(I18N.t("table.noHits"))}</td></tr>`;
    return;
  }

  els.pathogenTable.innerHTML = hits
    .map((hit) => {
      const row = hit.row;
      const minimizers = row.distinctMinimizers === null ? "NA" : `${formatInt(row.distinctMinimizers)} / ${formatInt(row.totalMinimizers)}`;
      const qBadge = hit.quarantineList === "quarantine"
        ? `<span class="pill quarantine-badge">${I18N.t("quarantine.label")}</span>`
        : hit.quarantineList === "monitoring"
        ? `<span class="pill monitoring-badge">${I18N.t("monitoring.label")}</span>`
        : "";
      return `
        <tr>
          <td><span class="pill ${hit.status.key}">${hit.status.label}</span></td>
          <td>
            <span class="taxon-name">${escapeHtml(displayName(hit))}</span>
            ${qBadge}
            <span class="subnote">taxid ${escapeHtml(row.taxid)} · ${escapeHtml(hit.note)}</span>
          </td>
          <td>${escapeHtml(hit.type)}</td>
          <td>${scoreBar(hit.score)}</td>
          <td>${formatPct(row.percent)}</td>
          <td>${formatInt(row.cladeReads)}</td>
          <td>${formatInt(row.directReads)}</td>
          <td>${minimizers}</td>
        </tr>
      `;
    })
    .join("");
}

function criteriaHtml() {
  return `
    <div><strong>总体原则：</strong>本软件基于 Kraken2 .k2report 文件整理病原体筛查结果。软件不会把所有物种注释都作为病原体报告，而是先根据人间传染病名录病原体知识库筛选候选项，再结合 reads、分类层级、minimizer 信息和样本背景进行分级展示。</div>
    <div><strong>候选范围：</strong>进入重点病原体检出表的 taxon 需要满足以下条件之一：TaxID 命中人间传染病名录知识库（精准匹配 species/subspecies/isolate/biotype 级别）；或该 taxon 的祖先属/科命中名录中的 genus/family 级病原体（clade 分支匹配）；或用户自定义病原体库命中。</div>
    <div><strong>匹配层级：</strong>名录中 genus 级条目表示该属所有种均为病原体（如布鲁氏菌属、弯曲杆菌属），annospecies 下任何 species 均可触发；species 级条目仅精准匹配该 TaxID。匹配层级在数据库中以「matchRank: exact/clade」标识。</div>
    <div><strong>降噪规则：</strong>人源序列、合成序列、未培养或环境来源条目、非特异性分类节点、与样本类型不匹配的常见共生菌或背景菌、direct reads 极低的低丰度命中，通常会被降低优先级或归为背景/暂不报告。</div>
    <div><strong>证据分：</strong>每个候选病原体会计算 0-100 的证据分。证据分用于结果排序和复核优先级判断，不代表阳性概率，也不等同于临床确诊置信度。</div>
    <div><strong>证据来源：</strong>证据分主要参考知识库命中、危害程度分类（第一/二/三/四类）、是否注释到明确 species、clade reads、direct reads、distinct minimizers、疑似背景/污染/非特异性命中，以及当前选择的样本类型。</div>
    <div><strong>重点关注：</strong>表示该 taxon 为病原体知识库中的第一类或第二类高关注对象，或具有较强的 reads/minimizer 支持。此类结果建议优先结合覆盖度、阴性/空白对照、近缘物种分布和必要的复核实验进一步确认。</div>
    <div><strong>需复核：</strong>表示该 taxon 具有明确病原体线索，但证据强度、危害程度、reads 数量、minimizer 分布或样本背景尚不足以直接列为重点关注。此类结果建议结合原始 reads、覆盖分布和对照样本判断。</div>
    <div><strong>低丰度线索：</strong>表示该 taxon 命中数量较低，或可能属于条件致病、共生、背景或低水平污染来源。此类结果通常作为筛查提示，不建议单独作为阳性结论。</div>
    <div><strong>背景/暂不报告：</strong>表示该 taxon 证据不足，或更可能来源于人源、合成序列、环境/未培养条目、非特异性分类或背景污染。默认情况下此类结果可被隐藏。</div>
    <div><strong>父级去重：</strong>如果已经检出明确的 species 或 subspecies，软件会隐藏其上级 genus/family 命中，避免同一来源在报告中重复出现。</div>
    <div><strong>展示排序：</strong>寄生虫/原虫和寄生虫/蠕虫优先展示，病毒其次，细菌再次；同一类型内按证据分从高到低排序，证据分相同时按 direct reads 从高到低排序。</div>
  `;
}

function renderDomainChart(sample) {
  const domains = sample.rows.filter((row) => row.rank === "D");
  const items = domains.length ? domains : sample.rows.filter((row) => row.depth <= 1);
  const top = items.sort((a, b) => b.cladeReads - a.cladeReads).slice(0, 8);
  const max = Math.max(...top.map((row) => row.cladeReads), 1);
  els.domainChart.innerHTML = top
    .map((row) => `
        <div class="bar-row">
          <div class="bar-label" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${(row.cladeReads / max) * 100}%"></div></div>
          <div class="bar-value">${formatInt(row.cladeReads)} · ${formatPct(row.percent)}</div>
        </div>
      `)
    .join("");
}

function renderTree() {
  const sample = state.samples[state.selectedSample];
  if (!sample) return;
  const query = state.treeQuery;
  let rows = sample.rows;
  if (query) {
    rows = rows.filter((row) => row.name.toLowerCase().includes(query) || row.taxid.includes(query));
  } else {
    rows = rows.filter((row) => row.depth <= 8 || row.directReads > 0).slice(0, 500);
  }

  els.treeTable.innerHTML = rows
    .slice(0, 600)
    .map((row) => `
      <tr>
        <td style="padding-left:${10 + Math.min(row.depth, 12) * 14}px">
          <span class="taxon-name">${escapeHtml(row.name)}</span>
        </td>
        <td>${escapeHtml(row.rankLabel)} <span class="subnote">${escapeHtml(row.rank)}</span></td>
        <td>${escapeHtml(row.taxid)}</td>
        <td>${formatPct(row.percent)}</td>
        <td>${formatInt(row.cladeReads)}</td>
        <td>${formatInt(row.directReads)}</td>
      </tr>
    `)
    .join("");
}

function renderMulti() {
  els.multiSampleCount.textContent = `${state.samples.length} ${I18N.t("count.samples")}`;
  els.matrixMetric.textContent = metricLabel(state.metric);
  renderSampleOverview();
  renderMatrix();
}

function renderSampleOverview() {
  els.sampleOverview.innerHTML = state.samples
    .map((sample) => {
      const counts = countStatuses(sample.pathogenHits);
      const total = Math.max(1, counts.critical + counts.review + counts.trace + counts.background);
      return `
        <div class="sample-card">
          <h4>${escapeHtml(sample.fileName)}</h4>
          <div class="stack" title="重点关注 / 需复核 / 低丰度线索 / 背景">
            <span class="status-critical" style="width:${(counts.critical / total) * 100}%"></span>
            <span class="status-review" style="width:${(counts.review / total) * 100}%"></span>
            <span class="status-trace" style="width:${(counts.trace / total) * 100}%"></span>
            <span class="status-background" style="width:${(counts.background / total) * 100}%"></span>
          </div>
          <span class="subnote">${I18N.t("summary.critical")} ${counts.critical} · ${I18N.t("summary.review")} ${counts.review} · ${I18N.t("summary.trace")} ${counts.trace} · ${I18N.t("status.background")} ${counts.background}</span>
        </div>
      `;
    })
    .join("");
}

function renderMatrix() {
  const taxa = collectMatrixTaxa();
  if (!taxa.length) {
    els.matrix.innerHTML = `<p class="subnote" style="padding:14px">${escapeHtml(I18N.t("table.noMatrix"))}</p>`;
    return;
  }

  const columns = state.samples.length + 1;
  const template = `minmax(220px, 280px) repeat(${state.samples.length}, minmax(120px, 1fr))`;
  let html = `<div class="matrix-grid" style="grid-template-columns:${template}">`;
  html += `<div class="matrix-head">${escapeHtml(I18N.t("th.pathogen"))}</div>`;
  html += state.samples.map((sample) => `<div class="matrix-head">${escapeHtml(shortName(sample.fileName))}</div>`).join("");

  taxa.forEach((taxon) => {
    html += `<div class="matrix-taxon">${escapeHtml(taxon.name)}<span class="subnote">taxid ${escapeHtml(taxon.taxid)}</span></div>`;
    state.samples.forEach((sample) => {
      const hit = sample.pathogenHits.find((item) => item.row.taxid === taxon.taxid);
      const value = hit ? metricValue(hit) : 0;
      const intensity = state.metric === "score" ? value : normalizeMetric(value, taxon.taxid);
      html += `<div class="matrix-cell" style="${matrixCellStyle(intensity, hit)}">${hit ? formatMetric(value) : "-"}</div>`;
    });
  });

  html += `</div>`;
  els.matrix.innerHTML = html;
}

function buildSingleReportHtml(sample) {
  const hits = getVisibleHits(sample);
  const counts = countStatuses(sample.pathogenHits);
  const classifiedPct = sample.totalReads ? (sample.classifiedReads / sample.totalReads) * 100 : 0;
  const title = I18N.t("report.singleTitle", { name: shortName(sample.fileName) });
  const hitRows = hits.length
    ? hits.map((hit) => reportHitRow(hit)).join("")
    : `<tr><td colspan="9">${escapeHtml(I18N.t("table.noHits"))}</td></tr>`;

  return reportDocument(
    title,
    `
      <section class="hero">
        <p class="eyebrow">${escapeHtml(I18N.t("report.singleEyebrow"))}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(makeInterpretation(sample))}</p>
      </section>
      <section class="summary">
        ${reportMetric(I18N.t("summary.critical"), counts.critical)}
        ${reportMetric(I18N.t("summary.review"), counts.review)}
        ${reportMetric(I18N.t("summary.trace"), counts.trace)}
        ${reportMetric(I18N.t("summary.classified"), formatPct(classifiedPct), `${formatInt(sample.classifiedReads)} / ${formatInt(sample.totalReads)}`)}
      </section>
      ${reportSettingsBlock()}
      <section>
        <h2>${escapeHtml(I18N.t("single.pathogenTable"))}</h2>
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(I18N.t("th.status"))}</th>
              <th>${escapeHtml(I18N.t("th.pathogen"))}</th>
              <th>${escapeHtml(I18N.t("th.taxid"))}</th>
              <th>${escapeHtml(I18N.t("th.type"))}</th>
              <th>${escapeHtml(I18N.t("th.score"))}</th>
              <th>${escapeHtml(I18N.t("th.cladePct"))}</th>
              <th>${escapeHtml(I18N.t("th.cladeReads"))}</th>
              <th>${escapeHtml(I18N.t("th.directReads"))}</th>
              <th>${escapeHtml(I18N.t("th.minimizers"))}</th>
            </tr>
          </thead>
          <tbody>${hitRows}</tbody>
        </table>
      </section>
      <section>
        <h2>${escapeHtml(I18N.t("report.criteriaTitle"))}</h2>
        <p class="method-text">${escapeHtml(I18N.t("method.text"))}</p>
        <h3>${escapeHtml(I18N.t("report.colDefs"))}</h3>
        <div class="col-def">
        <p><strong>${escapeHtml(I18N.t("th.status"))}</strong>：${escapeHtml(I18N.t("col.status"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.pathogen"))}</strong>：${escapeHtml(I18N.t("col.pathogen"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.taxid"))}</strong>：${escapeHtml(I18N.t("col.taxid"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.type"))}</strong>：${escapeHtml(I18N.t("col.type"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.score"))}</strong>：${escapeHtml(I18N.t("col.score"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.cladePct"))}</strong>：${escapeHtml(I18N.t("col.cladePct"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.cladeReads"))}</strong>：${escapeHtml(I18N.t("col.cladeReads"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.directReads"))}</strong>：${escapeHtml(I18N.t("col.directReads"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.minimizers"))}</strong>：${escapeHtml(I18N.t("col.minimizers"))}</p>
        </div>
      </section>
      <section>
        <h2>${escapeHtml(I18N.t("report.noticeTitle"))}</h2>
        <p class="note">${escapeHtml(reportNotice())}</p>
      </section>
    `,
  );
}

function buildMultiReportHtml() {
  const taxa = collectMatrixTaxa();
  const matrixRows = taxa.length
    ? taxa.map((taxon) => reportMatrixRow(taxon)).join("")
    : `<tr><td colspan="${state.samples.length + 1}">${escapeHtml(I18N.t("table.noMatrix"))}</td></tr>`;
  const overviewRows = state.samples
    .map((sample) => {
      const counts = countStatuses(sample.pathogenHits);
      return `
        <tr>
          <td>${escapeHtml(sample.fileName)}</td>
          <td>${counts.critical}</td>
          <td>${counts.review}</td>
          <td>${counts.trace}</td>
          <td>${counts.background}</td>
          <td>${formatInt(sample.classifiedReads)}</td>
          <td>${formatInt(sample.totalReads)}</td>
        </tr>
      `;
    })
    .join("");

  return reportDocument(
    I18N.t("report.multiTitle"),
    `
      <section class="hero">
        <p class="eyebrow">${escapeHtml(I18N.t("report.multiEyebrow"))}</p>
        <h1>${escapeHtml(I18N.t("report.multiTitle"))}</h1>
        <p>${escapeHtml(I18N.t("report.multiDesc", { n: state.samples.length, metric: metricLabel(state.metric) }))}</p>
      </section>
      ${reportSettingsBlock()}
      <section>
        <h2>${escapeHtml(I18N.t("multi.overview"))}</h2>
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(I18N.t("report.sample"))}</th>
              <th>${escapeHtml(I18N.t("summary.critical"))}</th>
              <th>${escapeHtml(I18N.t("summary.review"))}</th>
              <th>${escapeHtml(I18N.t("summary.trace"))}</th>
              <th>${escapeHtml(I18N.t("status.background"))}</th>
              <th>classified reads</th>
              <th>total reads</th>
            </tr>
          </thead>
          <tbody>${overviewRows}</tbody>
        </table>
      </section>
      <section>
        <h2>${escapeHtml(I18N.t("multi.matrix"))}</h2>
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(I18N.t("th.pathogen"))}</th>
              ${state.samples.map((sample) => `<th>${escapeHtml(shortName(sample.fileName))}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${matrixRows}</tbody>
        </table>
      </section>
      <section>
        <h2>${escapeHtml(I18N.t("report.criteriaTitle"))}</h2>
        <p class="method-text">${escapeHtml(I18N.t("method.text"))}</p>
        <h3>${escapeHtml(I18N.t("report.colDefs"))}</h3>
        <div class="col-def">
        <p><strong>${escapeHtml(I18N.t("th.status"))}</strong>：${escapeHtml(I18N.t("col.status"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.pathogen"))}</strong>：${escapeHtml(I18N.t("col.pathogen"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.taxid"))}</strong>：${escapeHtml(I18N.t("col.taxid"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.type"))}</strong>：${escapeHtml(I18N.t("col.type"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.score"))}</strong>：${escapeHtml(I18N.t("col.score"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.cladePct"))}</strong>：${escapeHtml(I18N.t("col.cladePct"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.cladeReads"))}</strong>：${escapeHtml(I18N.t("col.cladeReads"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.directReads"))}</strong>：${escapeHtml(I18N.t("col.directReads"))}</p>
        <p><strong>${escapeHtml(I18N.t("th.minimizers"))}</strong>：${escapeHtml(I18N.t("col.minimizers"))}</p>
        </div>
      </section>
      <section>
        <h2>${escapeHtml(I18N.t("report.noticeTitle"))}</h2>
        <p class="note">${escapeHtml(reportNotice())} ${escapeHtml(I18N.t("report.multiNotice"))}</p>
      </section>
    `,
  );
}

function buildMatrixCsv() {
  const taxa = collectMatrixTaxa();
  const header = ["taxid", "pathogen", "metric"];
  state.samples.forEach((sample) => {
    const name = shortName(sample.fileName);
    header.push(`${name}_status`, `${name}_value`, `${name}_direct_reads`, `${name}_clade_reads`);
  });

  const rows = taxa.map((taxon) => {
    const row = [taxon.taxid, taxon.name, metricLabel(state.metric)];
    state.samples.forEach((sample) => {
      const hit = sample.pathogenHits.find((item) => item.row.taxid === taxon.taxid);
      row.push(
        hit ? hit.status.label : "",
        hit ? rawMetricValue(hit) : "",
        hit ? hit.row.directReads : "",
        hit ? hit.row.cladeReads : "",
      );
    });
    return row;
  });

  return `\ufeff${[header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")}`;
}

function reportHitRow(hit) {
  const row = hit.row;
  const minimizers = row.distinctMinimizers === null ? "NA" : `${formatInt(row.distinctMinimizers)} / ${formatInt(row.totalMinimizers)}`;
  const qBadge = hit.quarantineList === "quarantine"
    ? ` <span class="badge quarantine-badge">${escapeHtml(I18N.t("quarantine.label"))}</span>`
    : hit.quarantineList === "monitoring"
    ? ` <span class="badge monitoring-badge">${escapeHtml(I18N.t("monitoring.label"))}</span>`
    : "";
  return `
    <tr>
      <td><span class="badge ${hit.status.key}">${hit.status.label}</span></td>
      <td><strong>${escapeHtml(displayName(hit))}</strong>${qBadge}<span>${escapeHtml(hit.note)}</span></td>
      <td>${escapeHtml(row.taxid)}</td>
      <td>${escapeHtml(hit.type)}</td>
      <td>${hit.score}/100</td>
      <td>${formatPct(row.percent)}</td>
      <td>${formatInt(row.cladeReads)}</td>
      <td>${formatInt(row.directReads)}</td>
      <td>${minimizers}</td>
    </tr>
  `;
}

function reportMatrixRow(taxon) {
  return `
    <tr>
      <td><strong>${escapeHtml(taxon.name)}</strong><span>taxid ${escapeHtml(taxon.taxid)}</span></td>
      ${state.samples
        .map((sample) => {
          const hit = sample.pathogenHits.find((item) => item.row.taxid === taxon.taxid);
          if (!hit) return `<td class="empty">-</td>`;
          return `<td><span class="badge ${hit.status.key}">${hit.status.label}</span><span>${formatMetric(metricValue(hit))}</span></td>`;
        })
        .join("")}
    </tr>
  `;
}

function reportSettingsBlock() {
  return `
    <section class="settings">
      <div><strong>${escapeHtml(I18N.t("ctrl.sampleType"))}</strong><span>${escapeHtml(sampleTypeLabel(state.sampleType))}</span></div>
      <div><strong>${escapeHtml(I18N.t("report.metricLabel"))}</strong><span>${escapeHtml(metricLabel(state.metric))}</span></div>
      <div><strong>${escapeHtml(I18N.t("ctrl.minDirect"))}</strong><span>${state.minDirect}</span></div>
      <div><strong>Top N</strong><span>${state.topN}</span></div>
      <div><strong>${escapeHtml(I18N.t("ctrl.hideBackground"))}</strong><span>${state.hideBackground ? I18N.t("report.bgHidden") : I18N.t("report.bgShown")}</span></div>
    </section>
  `;
}

function columnDefinitionsHtml() {
  const items = [
    ["判读", "软件给出的复核优先级，包括重点关注、需复核、低丰度线索、背景/暂不报告。该字段用于提示后续复核顺序，不代表临床确诊结论。"],
    ["病原体", "Kraken2 注释到的 taxon 名称。若该 TaxID 命中病原体知识库，会同时显示中文名；下方备注可能包含 TaxID、危害程度、BSL 等级、相关疾病、传播途径和建议样本类型等信息。"],
    ["TaxID", "NCBI taxonomy ID，用于合并多样本和连接病原体知识库。"],
    ["类型", "病原体类别，来自知识库或补充规则，例如细菌、病毒、真菌、寄生虫/原虫、寄生虫/蠕虫、待分类。该字段也会影响展示排序。"],
    ["证据分", "软件内部计算的 0-100 分值，用于衡量该 taxon 的复核优先级。分值综合知识库命中、风险等级、clade reads、direct reads、分类层级、minimizer 数量和背景扣分等因素。证据分不是阳性概率，也不是临床置信度百分比。"],
    ["clade%", "Kraken2 report 中该 taxon 及其所有子节点 reads 占总 reads 的比例。它是树状累计比例，例如某个 genus 的 clade% 包含其下所有 species 的 reads。"],
    ["clade reads", "分配到该 taxon 及其所有子节点的 reads 数。该值适合观察某个分类分支的总体信号，但不能单独说明 reads 都明确属于该 taxon 本身。"],
    ["direct reads", "直接分配到该 taxon 本身的 reads 数。相比 clade reads，该值更适合判断该 taxon 是否有明确命中；对于病原体筛查，direct reads 通常是更重要的证据之一。"],
    ["minimizers", "仅在 Kraken2 report 使用 --report-minimizer-data 时显示，格式为 distinct minimizers / total minimizers。distinct minimizers 表示不同 minimizer 的数量，total minimizers 表示 minimizer 命中的总次数。distinct 越多通常说明证据分布越丰富；total 较高但 distinct 很少时，需要谨慎解读。"],
  ];
  return `
    <div class="definitions">
      ${items.map(([term, desc]) => `<div><strong>${escapeHtml(term)}</strong><span>${escapeHtml(desc)}</span></div>`).join("")}
    </div>
  `;
}

function reportNotice() {
  return I18N.t("report.notice");
}

function reportMetric(label, value, hint = "") {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      ${hint ? `<em>${escapeHtml(hint)}</em>` : ""}
    </div>
  `;
}

function reportDocument(title, body) {
  const lang = I18N.lang === "zh" ? "zh-CN" : "en";
  const localeStr = new Date().toLocaleString(lang === "zh-CN" ? "zh-CN" : "en-US");
  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${reportCss()}</style>
  </head>
  <body>
    <main>
      ${body}
      <footer>${escapeHtml(I18N.t("report.generated", { time: localeStr }))}</footer>
    </main>
  </body>
</html>`;
}

function reportCss() {
  return `
    body{margin:0;background:#f6f7f9;color:#17201f;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(1180px,calc(100% - 32px));margin:24px auto 36px}
    section{margin-top:16px;background:#fff;border:1px solid #d9e0dd;border-radius:8px;padding:18px}
    .hero{background:#152622;color:#f8fbfa}.hero p{color:#dce8e4;max-width:920px}.eyebrow{margin:0 0 6px;color:#7aa696;font-size:12px;font-weight:800;text-transform:uppercase}.hero h1{margin:0;font-size:34px}
    h2{margin:0 0 12px;font-size:20px}h3{margin:0 0 6px;font-size:15px}.summary,.settings,.definitions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.summary div,.settings div,.definitions div,.criteria div,.db-report-group{border:1px solid #d9e0dd;border-radius:8px;padding:12px;background:#fbfcfc}.summary span,.settings strong,.definitions strong{display:block;color:#66736f;font-size:12px}.summary strong{display:block;margin-top:6px;font-size:28px}.summary em,.settings span,.definitions span{display:block;margin-top:4px;color:#66736f;font-size:12px;font-style:normal}.criteria{display:grid;gap:8px;margin-bottom:12px}.criteria strong{color:#17201f}.db-report-group{margin-top:10px}.db-report-group p{margin:0;color:#66736f;font-size:13px;line-height:1.55}.method-text{font-size:14px;line-height:1.9;margin:0 0 1em;color:#333}.col-def p{margin:0.35em 0;font-size:14px;line-height:1.75;color:#444}
    .command-block{overflow:auto;margin:10px 0 16px;border:1px solid #d9e0dd;border-radius:8px;background:#152622;color:#f8fbfa;padding:14px;line-height:1.45}.command-block code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px;border-bottom:1px solid #d9e0dd;text-align:left;vertical-align:top}th{background:#f9fbfa;color:#56615e;font-size:12px}td span{display:block;color:#66736f;font-size:12px;margin-top:3px}.badge{display:inline-block;margin:0 4px 2px 0;padding:4px 8px;border-radius:999px;font-weight:800}.critical{background:#f3d7d7;color:#832626}.review{background:#f4e1c2;color:#754708}.trace{background:#d6e4f4;color:#224d75}.background{background:#e8eceb;color:#56615e}.quarantine-badge{background:#c0392b;color:#fff;border:1px solid #922b21}.monitoring-badge{background:#e67e22;color:#fff;border:1px solid #b9651b}.empty{color:#9aa5a1}.note,footer{color:#66736f;font-size:13px}footer{margin-top:18px}
  `;
}

function downloadText(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function positionHelpTooltip(target) {
  const rect = target.getBoundingClientRect();
  const tooltipRect = helpTooltip.getBoundingClientRect();
  const margin = 12;
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.top - tooltipRect.height - 10;
  left = clamp(left, margin, window.innerWidth - tooltipRect.width - margin);
  if (top < margin) top = rect.bottom + 10;
  helpTooltip.style.left = `${left}px`;
  helpTooltip.style.top = `${top}px`;
}

function collectMatrixTaxa() {
  const map = new Map();
  state.samples.forEach((sample) => {
    getVisibleHits(sample).forEach((hit) => {
      const existing = map.get(hit.row.taxid);
      const value = metricValue(hit);
      if (!existing) {
        map.set(hit.row.taxid, { taxid: hit.row.taxid, name: displayName(hit), best: value, bestScore: hit.score });
      } else {
        existing.best = Math.max(existing.best, value);
        existing.bestScore = Math.max(existing.bestScore, hit.score);
      }
    });
  });
  return [...map.values()]
    .sort((a, b) => b.bestScore - a.bestScore || b.best - a.best)
    .slice(0, Math.max(1, state.topN));
}

function normalizeMetric(value, taxid) {
  const values = state.samples.map((sample) => {
    const hit = sample.pathogenHits.find((item) => item.row.taxid === taxid);
    return hit ? metricValue(hit) : 0;
  });
  const max = Math.max(...values, 1);
  return (value / max) * 100;
}

function matrixCellStyle(intensity, hit) {
  if (!hit) return "background:#fbfcfc;color:#9aa5a1";
  const alpha = clamp(intensity, 8, 100) / 100;
  const colors = {
    critical: `rgba(180, 59, 59, ${0.18 + alpha * 0.55})`,
    review: `rgba(168, 102, 18, ${0.18 + alpha * 0.50})`,
    trace: `rgba(49, 110, 168, ${0.14 + alpha * 0.46})`,
    background: `rgba(102, 115, 111, ${0.10 + alpha * 0.30})`,
  };
  return `background:${colors[hit.status.key]};color:#17201f`;
}

function summaryCard(label, value, hint) {
  return `
    <div class="summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <span>${escapeHtml(hint)}</span>
    </div>
  `;
}

function countStatuses(hits) {
  return hits.reduce(
    (acc, hit) => {
      acc[hit.status.key] += 1;
      return acc;
    },
    { critical: 0, review: 0, trace: 0, background: 0 },
  );
}

function metricValue(hit) {
  const row = hit.row;
  if (state.metric === "cladeReads") return row.cladeReads;
  if (state.metric === "directReads") return row.directReads;
  if (state.metric === "score") return hit.score;
  return row.percent;
}

function rawMetricValue(hit) {
  const value = metricValue(hit);
  if (state.metric === "percent") return Number(value).toFixed(4);
  return Math.round(value);
}

function metricLabel(metric) {
  return {
    percent: I18N.t("metric.percent"),
    cladeReads: I18N.t("metric.cladeReads"),
    directReads: I18N.t("metric.directReads"),
    score: I18N.t("metric.score"),
  }[metric];
}

function sampleTypeLabel(value) {
  return {
    clinical: I18N.t("stype.clinical"),
    respiratory: I18N.t("stype.respiratory"),
    blood: I18N.t("stype.blood"),
    csf: I18N.t("stype.csf"),
    stool: I18N.t("stype.stool"),
    environment: I18N.t("stype.environment"),
  }[value] ?? value;
}

function displayName(hit) {
  return hit.zh ? `${hit.row.name}（${hit.zh}）` : hit.row.name;
}

function scoreBar(score) {
  return `
    <div class="score">
      <div class="score-track"><div class="score-fill" style="width:${score}%"></div></div>
      <span class="subnote">${score}/100</span>
    </div>
  `;
}

function clean(value) {
  return String(value ?? "").trim();
}

function toNumber(value) {
  const parsed = Number.parseFloat(clean(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInt(value) {
  const parsed = Number.parseInt(clean(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatInt(value) {
  const locale = I18N.lang === "zh" ? "zh-CN" : "en-US";
  return new Intl.NumberFormat(locale).format(value ?? 0);
}

function formatPct(value) {
  const number = Number(value ?? 0);
  if (Math.abs(number) > 0 && Math.abs(number) < 0.01) return "<0.01%";
  return `${number.toFixed(2)}%`;
}

function formatMetric(value) {
  if (state.metric === "percent") return formatPct(value);
  if (state.metric === "score") return `${Math.round(value)}`;
  return formatInt(Math.round(value));
}

function shortName(name) {
  return name.replace(/\.(k2report|report|txt)$/i, "");
}

function safeFileName(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 120) || "kraken2-report";
}

function dateStamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Language toggle
document.getElementById("langToggle")?.addEventListener("click", () => {
  I18N.toggleLang();
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = I18N.t("lang.toggle");
});

// Re-render on language change
window.addEventListener("langchange", () => {
  render();
});
