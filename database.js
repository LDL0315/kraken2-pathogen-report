const STORAGE_KEY = "kraken2-pathogen-custom-db-v1";
const BASE_PATHOGENS = Array.isArray(window.SHENZHEN_PATHOGENS) ? window.SHENZHEN_PATHOGENS : [];
const DB_FIELDS = [
  "taxid",
  "zh",
  "englishName",
  "ncbiName",
  "ncbiRank",
  "type",
  "severity",
  "hazardClass",
  "matchRank",
  "biosafetyLevel",
  "syndrome",
  "disease",
  "transmission",
  "sample",
  "note",
  "quarantineList",
  "quarantineDisease",
];

const dbEls = {
  status: document.querySelector("#dbStatus"),
  summary: document.querySelector("#dbSummary"),
  search: document.querySelector("#dbSearch"),
  upload: document.querySelector("#dbUpload"),
  table: document.querySelector("#dbTable"),
  tableHead: document.querySelector("#dbTableHead"),
  visibleCount: document.querySelector("#visibleCount"),
  form: document.querySelector("#entryForm"),
  editorTitle: document.querySelector("#editorTitle"),
  formMessage: document.querySelector("#formMessage"),
  downloadJson: document.querySelector("#downloadJson"),
  downloadCsv: document.querySelector("#downloadCsv"),
  downloadTemplate: document.querySelector("#downloadTemplate"),
  resetCustom: document.querySelector("#resetCustom"),
  newEntry: document.querySelector("#newEntry"),
};

let customEntries = readCustomEntries();
let activeEntries = mergeEntries();

renderDatabase();

dbEls.search.addEventListener("input", renderTable);
dbEls.form.addEventListener("submit", saveFormEntry);
dbEls.newEntry.addEventListener("click", () => fillForm({ severity: "medium", type: "细菌" }));
dbEls.downloadJson.addEventListener("click", () => downloadText("pathogen-database.json", JSON.stringify(activeEntries, null, 2), "application/json;charset=utf-8"));
dbEls.downloadCsv.addEventListener("click", () => downloadText("pathogen-database.csv", toCsv(activeEntries), "text/csv;charset=utf-8"));
dbEls.downloadTemplate.addEventListener("click", () => downloadText("pathogen-template.csv", toCsv([]), "text/csv;charset=utf-8"));
dbEls.resetCustom.addEventListener("click", () => {
  if (!confirm(I18N.t("db.confirmReset"))) return;
  customEntries = [];
  localStorage.removeItem(STORAGE_KEY);
  activeEntries = mergeEntries();
  renderDatabase();
});
dbEls.upload.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const entries = file.name.toLowerCase().endsWith(".json") ? parseJsonEntries(text) : parseCsvEntries(text);
    mergeUploadedEntries(entries);
    dbEls.formMessage.textContent = I18N.t("db.imported", { n: entries.length });
  } catch (error) {
    dbEls.formMessage.textContent = I18N.t("db.importFail", { msg: error.message });
  } finally {
    event.target.value = "";
  }
});

document.getElementById("langToggle")?.addEventListener("click", () => {
  I18N.toggleLang();
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = I18N.t("lang.toggle");
});
window.addEventListener("langchange", renderDatabase);

function renderDatabase() {
  activeEntries = mergeEntries();
  dbEls.status.textContent = `${activeEntries.length} ${I18N.t("count.items")}`;
  const typeCounts = countBy(activeEntries, (item) => item.type || "待分类");
  dbEls.summary.innerHTML = [
    summaryCard(I18N.t("db.baseLib"), BASE_PATHOGENS.length, "pathogen-db.js"),
    summaryCard(I18N.t("db.customLib"), customEntries.length, "localStorage"),
    summaryCard(I18N.t("db.bacteria"), typeCounts.get("细菌") || 0, "Bacteria"),
    summaryCard(I18N.t("db.virus"), typeCounts.get("病毒") || 0, "Viruses"),
  ].join("");
  renderTableHead();
  renderTable();
}

function renderTableHead() {
  dbEls.tableHead.innerHTML = `
    <th>${escapeHtml(I18N.t("db.edit"))}</th>
    <th>${escapeHtml(I18N.t("th.source") || "Source")}</th>
    <th>${escapeHtml(I18N.t("form.zh"))}</th>
    <th>${escapeHtml(I18N.t("form.ncbiName"))}</th>
    <th>${escapeHtml(I18N.t("form.taxid"))}</th>
    <th>${escapeHtml(I18N.t("form.ncbiRank"))}</th>
    <th>${escapeHtml(I18N.t("form.matchRank"))}</th>
    <th>${escapeHtml(I18N.t("form.type"))}</th>
    <th>${escapeHtml(I18N.t("form.severity"))}</th>
    <th>${escapeHtml(I18N.t("quarantine.label"))}/${escapeHtml(I18N.t("monitoring.label"))}</th>
    <th>${escapeHtml(I18N.t("form.disease"))}/${escapeHtml(I18N.t("form.syndrome"))}</th>
    <th>${escapeHtml(I18N.t("form.transmission"))}/${escapeHtml(I18N.t("form.sample"))}</th>
  `;
}

function renderTable() {
  const query = dbEls.search.value.trim().toLowerCase();
  const rows = activeEntries
    .filter((item) => !query || searchableText(item).includes(query))
    .slice(0, 700);
  dbEls.visibleCount.textContent = `${rows.length} ${I18N.t("count.items")}`;
  dbEls.table.innerHTML = rows
    .map((item) => `
      <tr>
        <td><button class="mini-btn" type="button" data-taxid="${escapeHtml(item.taxid)}">${escapeHtml(I18N.t("db.edit"))}</button></td>
        <td><span class="pill ${item._source === "custom" ? "review" : ""}">${item._source === "custom" ? escapeHtml(I18N.t("db.local")) : escapeHtml(I18N.t("db.builtin"))}</span></td>
        <td><span class="taxon-name">${escapeHtml(item.zh || item.englishName || item.ncbiName)}</span><span class="subnote">${escapeHtml(item.englishName || "")}</span></td>
        <td>${escapeHtml(item.ncbiName || "-")}</td>
        <td>${escapeHtml(item.taxid)}</td>
        <td><span class="pill ${item.matchRank === "clade" ? "trace" : ""}">${escapeHtml(item.ncbiRank || "-")}</span></td>
        <td><span class="pill ${item.matchRank === "clade" ? "review" : ""}">${escapeHtml(item.matchRank === "clade" ? I18N.t("db.cladeFull") : I18N.t("db.exactPrecise"))}</span></td>
        <td>${escapeHtml(item.type || "-")}</td>
        <td>${escapeHtml(item.severity || "-")}<span class="subnote">${escapeHtml(item.hazardClass || "")}</span></td>
        <td>${item.quarantineList === "quarantine" ? `<span class="pill quarantine-badge">${escapeHtml(I18N.t("quarantine.label"))}</span><span class="subnote">${escapeHtml(item.quarantineDisease || "")}</span>` : item.quarantineList === "monitoring" ? `<span class="pill monitoring-badge">${escapeHtml(I18N.t("monitoring.label"))}</span><span class="subnote">${escapeHtml(item.quarantineDisease || "")}</span>` : "-"}</td>
        <td>${escapeHtml([item.disease, item.syndrome].filter(Boolean).join(" / ") || "-")}</td>
        <td>${escapeHtml([item.transmission, item.sample].filter(Boolean).join(" / ") || "-")}</td>
      </tr>
    `)
    .join("");

  dbEls.table.querySelectorAll("[data-taxid]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = activeEntries.find((item) => item.taxid === button.dataset.taxid);
      fillForm(entry);
    });
  });
}

function fillForm(entry = {}) {
  DB_FIELDS.forEach((field) => {
    const input = dbEls.form.elements[field];
    if (!input) return;
    input.value = entry[field] ?? "";
  });
  if (!dbEls.form.elements.severity.value) dbEls.form.elements.severity.value = "medium";
  if (!dbEls.form.elements.type.value) dbEls.form.elements.type.value = "细菌";
  dbEls.editorTitle.textContent = entry.taxid ? I18N.t("db.editEntry", { id: entry.taxid }) : I18N.t("db.newEntryTitle");
  dbEls.formMessage.textContent = "";
}

function saveFormEntry(event) {
  event.preventDefault();
  const entry = {};
  DB_FIELDS.forEach((field) => {
    const value = dbEls.form.elements[field]?.value.trim() || "";
    if (value) entry[field] = value;
  });
  if (!/^\d+$/.test(entry.taxid || "")) {
    dbEls.formMessage.textContent = I18N.t("db.taxidMustNum");
    return;
  }
  if (!entry.note) entry.note = buildNote(entry);
  upsertCustomEntry(entry);
  dbEls.formMessage.textContent = I18N.t("db.saved", { id: entry.taxid });
}

function mergeUploadedEntries(entries) {
  entries.forEach((entry) => {
    if (!/^\d+$/.test(entry.taxid || "")) return;
    upsertCustomEntry(entry, false);
  });
  persistCustomEntries();
  renderDatabase();
}

function upsertCustomEntry(entry, rerender = true) {
  const normalized = normalizeEntry(entry);
  const index = customEntries.findIndex((item) => item.taxid === normalized.taxid);
  if (index >= 0) customEntries[index] = normalized;
  else customEntries.push(normalized);
  persistCustomEntries();
  if (rerender) renderDatabase();
}

function mergeEntries() {
  const map = new Map();
  BASE_PATHOGENS.forEach((item) => map.set(String(item.taxid), { ...flattenEntry(item), _source: "base" }));
  customEntries.forEach((item) => map.set(String(item.taxid), { ...flattenEntry(item), _source: "custom" }));
  return [...map.values()].sort((a, b) => Number(a.taxid) - Number(b.taxid));
}

function flattenEntry(item) {
  return normalizeEntry({
    ...item,
    ...(item.taxonomy || {}),
  });
}

function normalizeEntry(item) {
  const entry = {};
  DB_FIELDS.forEach((field) => {
    const value = item[field] ?? "";
    if (value !== "") entry[field] = String(value).trim();
  });
  entry.taxid = String(entry.taxid || "").trim();
  entry.type ||= "待分类";
  entry.severity ||= "medium";
  entry.note ||= buildNote(entry);
  return entry;
}

function buildNote(entry) {
  return [
    entry.hazardClass && `危害程度：${entry.hazardClass}`,
    entry.biosafetyLevel && `培养：${entry.biosafetyLevel}`,
    entry.syndrome && `症候群：${entry.syndrome}`,
    entry.disease && `相关疾病：${entry.disease}`,
    entry.transmission && `传播途径：${entry.transmission}`,
    entry.sample && `建议样本：${entry.sample}`,
  ].filter(Boolean).join("；") || "来自自定义病原体知识库。";
}

function readCustomEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeEntry).filter((item) => item.taxid) : [];
  } catch {
    return [];
  }
}

function persistCustomEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customEntries, null, 2));
}

function parseJsonEntries(text) {
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : parsed.pathogens || parsed.entries || [];
  if (!Array.isArray(rows)) throw new Error("JSON 需要是数组，或包含 pathogens/entries 数组。");
  return rows.map(normalizeEntry).filter((item) => item.taxid);
}

function parseCsvEntries(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((item) => item.trim());
  return rows.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      const field = headerAlias(header);
      if (field) item[field] = row[index] || "";
    });
    return normalizeEntry(item);
  }).filter((item) => item.taxid);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((items) => items.some((item) => item.trim()));
}

function headerAlias(header) {
  const key = header.trim().toLowerCase();
  const aliases = {
    taxid: "taxid",
    "tax id": "taxid",
    中文名: "zh",
    zh: "zh",
    英文名: "englishName",
    englishname: "englishName",
    "english name": "englishName",
    查询用英文名: "queryName",
    queryname: "queryName",
    ncbi标准名: "ncbiName",
    ncbiname: "ncbiName",
    "ncbi name": "ncbiName",
    分类等级: "ncbiRank",
    ncbirank: "ncbiRank",
    ncbi分类等级: "ncbiRank",
    "ncbi rank": "ncbiRank",
    匹配层级: "matchRank",
    matchrank: "matchRank",
    类型: "type",
    type: "type",
    风险等级: "severity",
    severity: "severity",
    危害程度: "hazardClass",
    危害程度分类: "hazardClass",
    hazardclass: "hazardClass",
    bsl: "biosafetyLevel",
    培养: "biosafetyLevel",
    biosafetylevel: "biosafetyLevel",
    症候群: "syndrome",
    症候群分类: "syndrome",
    syndrome: "syndrome",
    疾病名称: "disease",
    disease: "disease",
    传播途径: "transmission",
    transmission: "transmission",
    样本采集: "sample",
    sample: "sample",
    备注: "note",
    note: "note",
    检疫监测: "quarantineList",
    检疫传染病: "quarantineList",
    监测传染病: "quarantineList",
    quarantinelist: "quarantineList",
    "quarantine list": "quarantineList",
    检疫疾病: "quarantineDisease",
    quarantinedisease: "quarantineDisease",
    "quarantine disease": "quarantineDisease",
  };
  return aliases[key] || "";
}

function toCsv(entries) {
  const rows = [DB_FIELDS, ...entries.map((entry) => DB_FIELDS.map((field) => entry[field] || ""))];
  return `\ufeff${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
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

function countBy(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const key = getter(item) || "未分类";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

function searchableText(item) {
  return DB_FIELDS.map((field) => item[field] || "").join(" ").toLowerCase();
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
