# kraken2-pathogen-report

A browser-based, fully local pathogen screening and reporting tool for Kraken2 `.k2report` files. No server, no build step — just open in a browser.

一个纯前端静态网页工具，用于读取 Kraken2 `.k2report` 文件并生成病原体检测报告风格的可视化结果。支持中英文切换。

---

## Quick Start / 快速开始

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser. Or simply open `index.html` directly.

Then visit `http://localhost:8000`。或直接用浏览器打开 `index.html`。

---

## Features / 功能

- Supports standard 6-column and 8-column (with `--report-minimizer-data`) Kraken2 reports.
- Single-sample report: auto-summary, key pathogen hits table, domain composition, taxonomy tree browser.
- Multi-sample comparison: detection overview, pathogen matrix heatmap.
- Export single-sample HTML report, multi-sample comparison HTML, and CSV matrix.
- Bilingual UI (Chinese / English) with one-click toggle.
- Pathogen knowledge base from the national notifiable infectious disease registry of China (500 entries).
- Two-tier matching: exact TaxID match (species/subspecies/isolate/biotype) + clade-level match (genus/family/species group).
- Editable pathogen database via `database.html` (CSV/JSON import/export, localStorage persistence).
- All processing runs locally in the browser — no data uploaded to any server.

---

## Method Statement / 方法引用

> A browser-based local pathogen screening tool was used to interpret Kraken2 classification results. The tool reads `.k2report` files and annotates each taxon against a built-in pathogen knowledge base derived from the national notifiable infectious disease registry of China (500 entries). The database employs a two-tier matching strategy: entries at species rank and below (species/subspecies/isolate/biotype) use exact TaxID matching; entries at genus rank and above (genus/family/species group) use clade-level matching, whereby all descendant species within the designated clade are considered potential pathogen hits. The tool integrates database match status, hazard classification, read distribution, taxonomic rank, and minimizer information to compute an evidence score, classifying results into four tiers: High Priority, Needs Review, Low-Abundance Clue, and Background/Not Reported. All data processing is performed locally in the browser without uploading to any external server.

---

## Files / 文件结构

| File | Description |
|------|-------------|
| `index.html` | Main report page (single + multi-sample) |
| `app.js` | Core logic: parsing, annotation, scoring, rendering, export |
| `i18n.js` | Internationalization engine (Chinese / English) |
| `pathogen-db.js` | Pathogen knowledge base (500 entries, generated from xlsx) |
| `database.html` + `database.js` | Pathogen database management page |
| `docs.html` | Documentation: criteria, column definitions, Kraken2 commands |
| `styles.css` | Global styles |

---

## Interpretation Tiers / 判读等级

| Tier | Description |
|------|-------------|
| **High Priority** | Database Category I/II pathogen or strong reads/minimizer support; prioritize for confirmatory testing |
| **Needs Review** | Clear pathogen lead but insufficient evidence for high priority; check raw reads and controls |
| **Low-Abundance Clue** | Low hit counts; screening hint only, not a standalone positive conclusion |
| **Background / Not Reported** | Insufficient evidence or likely contamination; hidden by default |

---

## Limitations / 判读边界

This tool performs rule-based stratification and visualization of Kraken2/nt reports. Outputs are detection leads and review priorities, **not clinical diagnostic conclusions**. Formal reporting should incorporate sample type, negative/blank controls, coverage, genomic distribution, cross-species misallocation, and confirmatory experiments.

本工具基于 Kraken2/nt report 做规则分层和可视化，输出的是"检测线索"和"复核优先级"，不是临床确诊结论。

---

© Copyright, developed by ldl · kraken2-pathogen-report
