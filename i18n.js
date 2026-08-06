/**
 * i18n.js - Internationalization engine for kraken2-pathogen-report
 * Supports Chinese (zh) and English (en) with localStorage persistence.
 */

const I18N = {
  lang: localStorage.getItem("k2pr-lang") || "zh",

  dict: {
    zh: {
      // Topbar
      "app.title": "病原体检测报告",
      "app.eyebrow": "Kraken2 / nt report viewer",
      "nav.docs": "判读说明",
      "nav.database": "病原体条目",
      "nav.back": "返回报告页",
      "lang.toggle": "EN",

      // Mode switch
      "mode.single": "单样本报告",
      "mode.multi": "多样本比较",

      // Upload
      "upload.title": "上传 .k2report 文件",
      "upload.desc": "支持 Kraken2 标准 6 列 report，也支持带 minimizer 数据的 8 列 report。所有解析和判读都在本地浏览器完成。",
      "upload.hint": "选择或拖入一个/多个报告文件",

      // Controls
      "ctrl.sampleType": "样本类型",
      "ctrl.metric": "比较指标",
      "ctrl.minDirect": "最低 direct reads",
      "ctrl.topN": "Top N",
      "ctrl.hideBackground": "隐藏背景/暂不报告",

      // Sample types
      "stype.clinical": "临床样本",
      "stype.respiratory": "呼吸道样本",
      "stype.blood": "血液/无菌体液",
      "stype.csf": "脑脊液",
      "stype.stool": "肠道/粪便样本",
      "stype.environment": "环境/水体样本",

      // Metrics
      "metric.percent": "clade 百分比",
      "metric.cladeReads": "clade reads",
      "metric.directReads": "direct reads",
      "metric.score": "证据分",

      // Empty state
      "empty.title": "等待报告文件",
      "empty.desc": "上传后会自动生成病原体检出摘要、证据表、组成图和多样本矩阵。",

      // Single view
      "single.eyebrow": "single sample",
      "single.title": "单样本报告",
      "single.interpretation": "自动判读摘要",
      "single.pathogenTable": "重点病原体检出",
      "single.domainChart": "域级组成概览",
      "single.denoise": "降噪视图",
      "single.tree": "原始分类树检索",
      "single.treePlaceholder": "输入名称或 taxid",
      "single.exportHtml": "下载报告 HTML",

      // Multi view
      "multi.eyebrow": "cohort comparison",
      "multi.title": "多样本病原体比较",
      "multi.overview": "样本检出概览",
      "multi.byStatus": "按判读等级",
      "multi.matrix": "病原体检出矩阵",
      "multi.exportHtml": "下载比较 HTML",
      "multi.exportCsv": "下载矩阵 CSV",
      "multi.compactView": "紧凑视图",
      "multi.detailedView": "详细视图",
      "multi.sampleLegend": "样本编号对照",
      "multi.colorLegend": "颜色图例",
      "multi.lowIntensity": "低",
      "multi.highIntensity": "高",
      "multi.filterTitle": "选择比较的病原体",
      "multi.selectAll": "全选",
      "multi.deselectAll": "取消全选",
      "multi.filterNone": "未选择任何病原体",
      "multi.filterCount": "已选 {n} / 全部 {total}",
      "multi.filterTip": "点击标签切换显示/隐藏",

      // Table headers
      "th.status": "判读",
      "th.pathogen": "病原体",
      "th.type": "类型",
      "th.score": "证据分",
      "th.cladePct": "clade%",
      "th.cladeReads": "clade reads",
      "th.directReads": "direct reads",
      "th.minimizers": "minimizers",
      "th.taxon": "Taxon",
      "th.rank": "Rank",
      "th.taxid": "TaxID",

      // Status labels
      "status.critical": "重点关注",
      "status.review": "需复核",
      "status.trace": "低丰度线索",
      "status.background": "背景/暂不报告",

      // Quarantine / Monitoring disease labels
      "quarantine.label": "检疫传染病",
      "monitoring.label": "监测传染病",

      // Summary cards
      "summary.critical": "重点关注",
      "summary.review": "需复核",
      "summary.trace": "低丰度线索",
      "summary.classified": "分类 reads",
      "summary.criticalHint": "建议优先复核",
      "summary.reviewHint": "有病原体线索",
      "summary.traceHint": "谨慎解释",

      // Counts
      "count.items": "项",
      "count.samples": "个样本",

      // Interpretation texts
      "interp.critical": "本样本检出 {n} 个重点关注病原体线索，{names} 的证据强度最高。建议结合样本类型、阴性/空白对照、参考基因组覆盖分布、重复比对或靶向实验进行复核；Kraken2/nt 结果不应单独作为临床确诊依据。",
      "interp.review": "本样本未达到重点关注阈值，但有 {n} 个需复核病原体线索。建议优先查看 direct reads、minimizer 数量、同属近缘物种是否共同命中，以及对照样本中是否存在相同背景。",
      "interp.trace": "本样本仅见 {n} 个低丰度病原体线索，当前更适合作为筛查提示。若样本来自无菌部位或目标病原高度相关，可进一步复核覆盖度和原始 reads。",
      "interp.none": "本样本未见达到当前阈值的重点病原体线索。仍建议结合样本质量、测序深度和对照结果判断是否需要降低阈值或补充复核。",

      // Table empty
      "table.noHits": "当前阈值下没有可报告病原体线索。",
      "table.noMatrix": "当前阈值下没有可比较的病原体线索。",

      // Footer
      "footer.notice": "报告提示：本工具只报告内置重点病原体 taxid 或名称规则命中的 taxon，并按证据分分为重点关注、需复核、低丰度线索和背景/暂不报告；证据分综合 direct reads、clade reads、species 层级、minimizers、风险等级和样本背景，不代表阳性概率。结果应结合样本类型、阴性/空白对照、覆盖度、基因组分布和必要的复核实验解读。",
      "footer.copyright": "© 版权所有，由 ldl 开发 · kraken2-pathogen-report",

      // Docs page
      "docs.title": "判读说明",
      "docs.method": "工具概述（方法引用）",
      "docs.usage": "使用说明",
      "docs.criteria": "判读标准",
      "docs.columns": "重点病原体检出列说明",
      "docs.commands": "Kraken2 推荐命令",
      "docs.dbCoverage": "判读数据库覆盖",
      "docs.openDb": "打开病原体条目",

      // Database page
      "db.title": "病原体条目",
      "db.eyebrow": "pathogen knowledge base",
      "db.management": "条目管理",
      "db.mgmtDesc": "支持 CSV/JSON 上传合并；保存到本地后会自动参与主报告判读。",
      "db.loading": "加载中",
      "db.searchPlaceholder": "搜索中文名、英文名、taxid、疾病、传播途径",
      "db.uploadBtn": "上传 CSV/JSON",
      "db.downloadJson": "下载 JSON",
      "db.downloadCsv": "下载 CSV",
      "db.downloadTemplate": "下载模板",
      "db.resetCustom": "清除本地修改",
      "db.editorTitle": "新增/编辑条目",
      "db.newEntry": "新建空白条目",
      "db.entryList": "条目列表",
      "db.saveBtn": "保存到本地判读库",
      "db.baseLib": "基础库",
      "db.customLib": "本地修改",
      "db.bacteria": "细菌",
      "db.virus": "病毒",
      "db.fungus": "真菌",
      "db.local": "本地",
      "db.builtin": "内置",
      "db.edit": "编辑",
      "db.cladeFull": "clade 全分支",
      "db.exactPrecise": "exact 精准",
      "db.confirmReset": "确定清除当前浏览器保存的病原体条目修改吗？",
      "db.taxidMustNum": "TaxID 必须是数字。",
      "db.saved": "已保存 TaxID {id}。",
      "db.imported": "已导入 {n} 条记录。",
      "db.importFail": "导入失败：{msg}",
      "db.editEntry": "编辑条目：{id}",
      "db.newEntryTitle": "新增条目",

      // Form labels
      "form.taxid": "TaxID",
      "form.zh": "中文名",
      "form.englishName": "英文名",
      "form.ncbiName": "NCBI 标准名",
      "form.ncbiRank": "NCBI 分类等级",
      "form.type": "类型",
      "form.severity": "风险等级",
      "form.hazardClass": "危害程度",
      "form.matchRank": "匹配层级",
      "form.bsl": "BSL",
      "form.syndrome": "症候群",
      "form.disease": "疾病名称",
      "form.transmission": "传播途径",
      "form.sample": "样本采集",
      "form.note": "备注",
      "form.rankUnspecified": "未指定",

      // Report (downloaded HTML)
      "report.singleTitle": "{name} 病原体检测报告",
      "report.multiTitle": "Kraken2 多样本病原体比较报告",
      "report.singleEyebrow": "single sample report",
      "report.multiEyebrow": "cohort comparison report",
      "report.multiDesc": "共纳入 {n} 个样本，矩阵指标为 {metric}，显示当前阈值和 Top N 设置下的病原体线索。",
      "report.criteriaTitle": "判读标准与列说明",
      "report.colDefs": "列说明",
      "report.noticeTitle": "报告提示",
      "report.notice": "本报告基于 Kraken2 report 进行本地规则分层，输出的是检测线索和复核优先级，不是临床确诊结论。正式解释应结合样本类型、阴性/空白对照、覆盖度、基因组分布、近缘物种误分配和必要的复核实验。",
      "report.multiNotice": "多样本比较用于定位样本间共同或差异性病原体线索。若用于正式报告，建议加入批次阴性/空白对照、阳性对照、覆盖度和污染背景库。",
      "report.generated": "生成时间：{time} · kraken2-pathogen-report",
      "report.settings": "设置",
      "report.bgHidden": "隐藏",
      "report.bgShown": "显示",
      "report.sample": "样本",
      "report.metricLabel": "指标",

      // Method text
      "method.text": "本研究采用一款基于浏览器的本地化病原体筛查工具对 Kraken2 分类结果进行判读。该工具读取 .k2report 报告文件，通过内置的《人间传染病名录》病原体知识库（500 条目）对每个分类单元进行注释。知识库采用两级匹配策略：种级及以下条目（species/subspecies/isolate/biotype）执行精确 TaxID 匹配；属级及以上条目（genus/family/species group）执行分支级匹配，即该分类下所有子代物种均视为潜在病原体检出。工具综合知识库命中、危害程度、reads 分布、分类层级和 minimizer 信息计算证据分，并将结果分为\u201c重点关注\u201d\u201c需复核\u201d\u201c低丰度线索\u201d\u201c背景/暂不报告\u201d四个等级。全部数据处理在浏览器本地完成，无需上传至服务器，可输出交互式 HTML 报告、多样本比较矩阵及 CSV 汇总表。",

      // Column definitions
      "col.status": "软件给出的复核优先级，包括重点关注、需复核、低丰度线索、背景/暂不报告。该字段用于提示后续复核顺序，不代表临床确诊结论。",
      "col.pathogen": "Kraken2 注释到的 taxon 名称。若该 TaxID 命中病原体知识库，会同时显示中文名；下方备注可能包含 TaxID、危害程度、BSL 等级、相关疾病、传播途径和建议样本类型等信息。",
      "col.taxid": "NCBI taxonomy ID，用于合并多样本和连接病原体知识库。",
      "col.type": "病原体类别，来自知识库或补充规则，例如细菌、病毒、真菌、寄生虫/原虫、寄生虫/蠕虫、待分类。该字段也会影响展示排序。",
      "col.score": "软件内部计算的 0–100 分值，用于衡量该 taxon 的复核优先级。分值综合知识库命中、风险等级、clade reads、direct reads、分类层级、minimizer 数量和背景扣分等因素。证据分不是阳性概率，也不是临床确诊置信度百分比。",
      "col.cladePct": "Kraken2 report 中该 taxon 及其所有子节点 reads 占总 reads 的比例。它是树状累计比例，例如某个 genus 的 clade% 包含其下所有 species 的 reads。",
      "col.cladeReads": "分配到该 taxon 及其所有子节点的 reads 数。该值适合观察某个分类分支的总体信号，但不能单独说明 reads 都明确属于该 taxon 本身。",
      "col.directReads": "直接分配到该 taxon 本身的 reads 数。相比 clade reads，该值更适合判断该 taxon 是否有明确命中；对于病原体筛查，direct reads 通常是更重要的证据之一。",
      "col.minimizers": "仅在 Kraken2 report 使用 --report-minimizer-data 时显示，格式为 distinct minimizers / total minimizers。distinct minimizers 表示不同 minimizer 的数量，total minimizers 表示 minimizer 命中的总次数。distinct 越多通常说明证据分布越丰富；total 较高但 distinct 很少时，需要谨慎解读。",

      // Criteria list
      "crit.general": "总体原则",
      "crit.generalDesc": "本软件基于 Kraken2 .k2report 文件整理病原体筛查结果。软件不会把所有物种注释都作为病原体报告，而是先根据人间传染病名录病原体知识库筛选候选项，再结合 reads、分类层级、minimizer 信息和样本背景进行分级展示。",
      "crit.candidate": "候选范围",
      "crit.candidateDesc": "进入重点病原体检出表的 taxon 需要满足以下条件之一：TaxID 命中人间传染病名录知识库（精准匹配 species/subspecies/isolate/biotype 级别）；或该 taxon 的祖先属/科命中名录中的 genus/family 级病原体（clade 分支匹配）；或用户自定义病原体库命中。",
      "crit.matchLevel": "匹配层级",
      "crit.matchLevelDesc": "名录中 genus 级条目表示该属所有种均为病原体（如布鲁氏菌属、弯曲杆菌属），species 下任何 species 均可触发；species 级条目仅精准匹配该 TaxID。匹配层级在数据库中以 matchRank: exact/clade 标识。",
      "crit.denoise": "降噪规则",
      "crit.denoiseDesc": "人源序列、合成序列、未培养或环境来源条目、非特异性分类节点、与样本类型不匹配的常见共生菌或背景菌、direct reads 极低的低丰度命中，通常会被降低优先级或归为背景/暂不报告。",
      "crit.score": "证据分",
      "crit.scoreDesc": "每个候选病原体会计算 0-100 的证据分。证据分用于结果排序和复核优先级判断，不代表阳性概率，也不等同于临床确诊置信度。",
      "crit.scoreSource": "证据来源",
      "crit.scoreSourceDesc": "证据分主要参考知识库命中、危害程度分类（第一/二/三/四类）、是否注释到明确 species、clade reads、direct reads、distinct minimizers、疑似背景/污染/非特异性命中，以及当前选择的样本类型。",
      "crit.critical": "重点关注",
      "crit.criticalDesc": "表示该 taxon 为病原体知识库中的第一类或第二类高关注对象，或具有较强的 reads/minimizer 支持。此类结果建议优先结合覆盖度、阴性/空白对照、近缘物种分布和必要的复核实验进一步确认。",
      "crit.review": "需复核",
      "crit.reviewDesc": "表示该 taxon 具有明确病原体线索，但证据强度、危害程度、reads 数量、minimizer 分布或样本背景尚不足以直接列为重点关注。此类结果建议结合原始 reads、覆盖分布和对照样本判断。",
      "crit.trace": "低丰度线索",
      "crit.traceDesc": "表示该 taxon 命中数量较低，或可能属于条件致病、共生、背景或低水平污染来源。此类结果通常作为筛查提示，不建议单独作为阳性结论。",
      "crit.bg": "背景/暂不报告",
      "crit.bgDesc": "表示该 taxon 证据不足，或更可能来源于人源、合成序列、环境/未培养条目、非特异性分类或背景污染。默认情况下此类结果可被隐藏。",
      "crit.dedup": "父级去重",
      "crit.dedupDesc": "如果已经检出明确的 species 或 subspecies，软件会隐藏其上级 genus/family 命中，避免同一来源在报告中重复出现。",
      "crit.sort": "展示排序",
      "crit.sortDesc": "寄生虫/原虫和寄生虫/蠕虫优先展示，病毒其次，细菌再次；同一类型内按证据分从高到低排序，证据分相同时按 direct reads 从高到低排序。",

      // Docs usage
      "docs.fileInput": "文件输入",
      "docs.fileInputDesc": "上传 Kraken2 .k2report 文件，支持标准 6 列 report，也支持 --report-minimizer-data 生成的 8 列 report。",
      "docs.singleReport": "单样本报告",
      "docs.singleReportDesc": "用于查看一个样本的自动摘要、重点病原体检出表、域级组成和原始分类树检索。",
      "docs.multiCompare": "多样本比较",
      "docs.multiCompareDesc": "用于比较多个样本中同一病原体线索的检出状态和指标，可导出 HTML 或 CSV 矩阵。",
      "docs.localProcessing": "本地处理",
      "docs.localProcessingDesc": "所有解析、筛选和报告导出都在浏览器本地完成，样本文件不会上传到服务器。",
      "docs.reviewAdvice": "复核建议",
      "docs.reviewAdviceDesc": "正式报告前建议结合阴性/空白对照、覆盖度、基因组分布、近缘物种误分配和必要的复核实验。",

      // Docs DB coverage
      "docs.source": "内置来源",
      "docs.sourceDesc": "当前基础库由《人间传染病名录》生成，包含 500 个病原体条目。",
      "docs.matchLevelDb": "匹配层级",
      "docs.matchLevelDbDesc": "species/subspecies/isolate/biotype 级别为精准匹配（仅该 TaxID）；genus/family/species group 级别为 clade 全分支匹配（该分类下所有子孙 species 均视为病原体检出）。",
      "docs.maintainPage": "可维护页面",
      "docs.maintainPageDesc": "病原体条目已独立为管理页，可搜索、编辑、新增、上传 CSV/JSON 合并，并下载当前知识库。",
      "docs.effective": "判读生效方式",
      "docs.effectiveDesc": "在管理页保存到本地的修改会自动参与主报告判读；若更换浏览器或电脑，可先下载 JSON/CSV，再在新环境上传导入。",

      // Docs commands
      "docs.recommendedOutput": "推荐输出",
      "docs.recommendedOutputDesc": "本软件读取 Kraken2 .k2report 文件。建议在 Kraken2 分析时输出标准 report，并开启 minimizer 信息。",
      "docs.paired": "双端测序",
      "docs.single": "单端测序",
      "docs.dehost": "临床样本建议先去宿主",
      "docs.paramAdvice": "参数建议",
      "docs.paramAdviceDesc": "--report 生成本软件读取的核心文件；--report-minimizer-data 输出 distinct/total minimizers；--confidence 0.05 适合初筛，较保守场景可尝试 0.1；--minimum-hit-groups 3 可减少单个局部匹配造成的误报；--output 保留逐 read 分类结果，便于后续 reads 提取和覆盖度复核。",
      "docs.dbAdvice": "数据库建议",
      "docs.dbAdviceDesc": "常规病原体筛查建议优先考虑 Kraken2 PlusPF；需要更广谱补充时可使用 core_nt。完整 nt 覆盖广，但冗余和背景命中更多、运行成本更高，不建议作为默认生产筛查库。",
      "docs.saveAdvice": "结果保存",
      "docs.saveAdviceDesc": "后端建议至少保存 sample.k2report、sample.kraken、sample.log 和 sample.run.json。sample.run.json 可记录数据库路径、Kraken2 版本、confidence、minimum-hit-groups、是否开启 minimizer 数据、宿主去除方式和单双端模式。",

      // DB upload notice
      "db.uploadNotice": "上传说明：JSON 支持当前页面下载的数组格式；CSV 推荐使用\u201c下载模板\u201d生成的表头。静态网页不能直接改写 pathogen-db.js，本页修改会保存在当前浏览器本地。",
      "docs.footerNotice": "说明：当前覆盖范围是本工具内置的初筛规则，不等同于完整临床病原体知识库。后续可替换为正式 pathogen taxid 知识库。",

      // Help tooltips
      "help.status": "按规则分层后的复核优先级：重点关注、需复核、低丰度线索、背景/暂不报告。",
      "help.pathogen": "Kraken2 注释到的 taxon 名称；若在内置库中，会显示中文名。",
      "help.type": "细菌、病毒、真菌、寄生虫/原虫、寄生虫/蠕虫等规则分类。",
      "help.score": "0-100 的内部证据分，综合病原体库命中、风险等级、direct reads、clade reads、species 层级和 minimizer 数量。不是阳性概率。",
      "help.cladePct": "该 taxon 及其所有子节点占总 classified/unclassified reads 的百分比，来自 Kraken2 report 第一列。",
      "help.cladeReads": "分配到该 taxon 及其子节点的 reads 数。",
      "help.directReads": "直接分配到该 taxon 本身的 reads 数，通常比 clade reads 更适合判断明确命中。",
      "help.minimizers": "distinct / total minimizers。不同 minimizer 数越多，说明命中证据分布越丰富；少数 minimizer 重复命中需谨慎。",
    },

    en: {
      // Topbar
      "app.title": "Pathogen Detection Report",
      "app.eyebrow": "Kraken2 / nt report viewer",
      "nav.docs": "Documentation",
      "nav.database": "Pathogen Database",
      "nav.back": "Back to Report",
      "lang.toggle": "中文",

      // Mode switch
      "mode.single": "Single Sample",
      "mode.multi": "Multi-Sample",

      // Upload
      "upload.title": "Upload .k2report Files",
      "upload.desc": "Supports standard 6-column Kraken2 reports and 8-column reports with minimizer data. All parsing and analysis runs locally in your browser.",
      "upload.hint": "Select or drag one/more report files",

      // Controls
      "ctrl.sampleType": "Sample Type",
      "ctrl.metric": "Comparison Metric",
      "ctrl.minDirect": "Min direct reads",
      "ctrl.topN": "Top N",
      "ctrl.hideBackground": "Hide background",

      // Sample types
      "stype.clinical": "Clinical sample",
      "stype.respiratory": "Respiratory",
      "stype.blood": "Blood / sterile fluid",
      "stype.csf": "CSF",
      "stype.stool": "Stool / fecal",
      "stype.environment": "Environmental / water",

      // Metrics
      "metric.percent": "clade percentage",
      "metric.cladeReads": "clade reads",
      "metric.directReads": "direct reads",
      "metric.score": "Evidence score",

      // Empty state
      "empty.title": "Waiting for report files",
      "empty.desc": "Upload files to generate pathogen summary, evidence table, composition chart and multi-sample matrix.",

      // Single view
      "single.eyebrow": "single sample",
      "single.title": "Single Sample Report",
      "single.interpretation": "Auto Interpretation Summary",
      "single.pathogenTable": "Key Pathogen Hits",
      "single.domainChart": "Domain Composition",
      "single.denoise": "denoised view",
      "single.tree": "Taxonomy Tree Browser",
      "single.treePlaceholder": "Search by name or taxid",
      "single.exportHtml": "Download Report HTML",

      // Multi view
      "multi.eyebrow": "cohort comparison",
      "multi.title": "Multi-Sample Pathogen Comparison",
      "multi.overview": "Sample Detection Overview",
      "multi.byStatus": "by status tier",
      "multi.matrix": "Pathogen Detection Matrix",
      "multi.exportHtml": "Download Comparison HTML",
      "multi.exportCsv": "Download Matrix CSV",
      "multi.compactView": "Compact View",
      "multi.detailedView": "Detailed View",
      "multi.sampleLegend": "Sample Legend",
      "multi.colorLegend": "Color Legend",
      "multi.lowIntensity": "Low",
      "multi.highIntensity": "High",
      "multi.filterTitle": "Select Pathogens to Compare",
      "multi.selectAll": "Select All",
      "multi.deselectAll": "Deselect All",
      "multi.filterNone": "No pathogen selected",
      "multi.filterCount": "{n} / {total} selected",
      "multi.filterTip": "Click tag to toggle show/hide",

      // Table headers
      "th.status": "Status",
      "th.pathogen": "Pathogen",
      "th.type": "Type",
      "th.score": "Score",
      "th.cladePct": "clade%",
      "th.cladeReads": "clade reads",
      "th.directReads": "direct reads",
      "th.minimizers": "minimizers",
      "th.taxon": "Taxon",
      "th.rank": "Rank",
      "th.taxid": "TaxID",

      // Status labels
      "status.critical": "High Priority",
      "status.review": "Needs Review",
      "status.trace": "Low-Abundance Clue",
      "status.background": "Background / Not Reported",

      // Quarantine / Monitoring disease labels
      "quarantine.label": "Quarantine",
      "monitoring.label": "Monitoring",

      // Summary cards
      "summary.critical": "High Priority",
      "summary.review": "Needs Review",
      "summary.trace": "Low-Abundance",
      "summary.classified": "Classified reads",
      "summary.criticalHint": "Priority review",
      "summary.reviewHint": "Pathogen线索",
      "summary.traceHint": "Interpret with caution",

      // Counts
      "count.items": "items",
      "count.samples": "samples",

      // Interpretation texts
      "interp.critical": "This sample detected {n} high-priority pathogen hits, with {names} showing the highest evidence strength. Recommend confirmation with sample type, negative/blank controls, reference genome coverage, repeat alignment or targeted experiments; Kraken2/nt results should not be used as the sole basis for clinical diagnosis.",
      "interp.review": "This sample did not reach the high-priority threshold, but has {n} pathogen hits needing review. Suggest checking direct reads, minimizer counts, whether related species within the same genus are co-detected, and whether the same background exists in control samples.",
      "interp.trace": "This sample shows only {n} low-abundance pathogen clues, currently more suitable as a screening hint. If the sample is from a sterile site or the target pathogen is highly relevant, further review of coverage and raw reads is recommended.",
      "interp.none": "No pathogen hits reaching the current threshold were detected in this sample. Still recommend evaluating sample quality, sequencing depth, and control results to determine whether threshold adjustment or additional review is needed.",

      // Table empty
      "table.noHits": "No reportable pathogen hits under current thresholds.",
      "table.noMatrix": "No comparable pathogen hits under current thresholds.",

      // Footer
      "footer.notice": "Note: This tool only reports taxa matching the built-in pathogen database or name-based rules, stratified by evidence score into High Priority, Needs Review, Low-Abundance Clue, and Background. The evidence score integrates direct reads, clade reads, species-level annotation, minimizers, risk level, and sample background; it does not represent a probability of positivity. Results should be interpreted with sample type, negative/blank controls, coverage, genomic distribution, and confirmatory experiments.",
      "footer.copyright": "© Copyright, developed by ldl · kraken2-pathogen-report",

      // Docs page
      "docs.title": "Documentation",
      "docs.method": "Tool Overview (Method Statement)",
      "docs.usage": "Usage Guide",
      "docs.criteria": "Interpretation Criteria",
      "docs.columns": "Column Definitions",
      "docs.commands": "Recommended Kraken2 Commands",
      "docs.dbCoverage": "Database Coverage",
      "docs.openDb": "Open Pathogen Database",

      // Database page
      "db.title": "Pathogen Database",
      "db.eyebrow": "pathogen knowledge base",
      "db.management": "Entry Management",
      "db.mgmtDesc": "Supports CSV/JSON upload and merge; saved entries automatically participate in report interpretation.",
      "db.loading": "Loading",
      "db.searchPlaceholder": "Search name, taxid, disease, transmission",
      "db.uploadBtn": "Upload CSV/JSON",
      "db.downloadJson": "Download JSON",
      "db.downloadCsv": "Download CSV",
      "db.downloadTemplate": "Download Template",
      "db.resetCustom": "Clear Local Changes",
      "db.editorTitle": "Add / Edit Entry",
      "db.newEntry": "New Blank Entry",
      "db.entryList": "Entry List",
      "db.saveBtn": "Save to Local Database",
      "db.baseLib": "Base Library",
      "db.customLib": "Local Changes",
      "db.bacteria": "Bacteria",
      "db.virus": "Virus",
      "db.fungus": "Fungi",
      "db.local": "Local",
      "db.builtin": "Built-in",
      "db.edit": "Edit",
      "db.cladeFull": "clade (all descendants)",
      "db.exactPrecise": "exact (precise)",
      "db.confirmReset": "Are you sure you want to clear all locally saved pathogen entries?",
      "db.taxidMustNum": "TaxID must be numeric.",
      "db.saved": "Saved TaxID {id}.",
      "db.imported": "Imported {n} records.",
      "db.importFail": "Import failed: {msg}",
      "db.editEntry": "Edit Entry: {id}",
      "db.newEntryTitle": "New Entry",

      // Form labels
      "form.taxid": "TaxID",
      "form.zh": "Chinese Name",
      "form.englishName": "English Name",
      "form.ncbiName": "NCBI Standard Name",
      "form.ncbiRank": "NCBI Taxonomic Rank",
      "form.type": "Type",
      "form.severity": "Severity",
      "form.hazardClass": "Hazard Class",
      "form.matchRank": "Match Level",
      "form.bsl": "BSL",
      "form.syndrome": "Syndrome",
      "form.disease": "Disease",
      "form.transmission": "Transmission",
      "form.sample": "Sample Source",
      "form.note": "Note",
      "form.rankUnspecified": "Unspecified",

      // Report (downloaded HTML)
      "report.singleTitle": "{name} Pathogen Detection Report",
      "report.multiTitle": "Kraken2 Multi-Sample Pathogen Comparison Report",
      "report.singleEyebrow": "single sample report",
      "report.multiEyebrow": "cohort comparison report",
      "report.multiDesc": "Includes {n} samples, matrix metric is {metric}, showing pathogen hits under current thresholds and Top N settings.",
      "report.criteriaTitle": "Criteria & Column Definitions",
      "report.colDefs": "Column Definitions",
      "report.noticeTitle": "Report Notice",
      "report.notice": "This report is based on local rule-based stratification of Kraken2 reports, outputting detection leads and review priorities, not clinical diagnostic conclusions. Formal interpretation should incorporate sample type, negative/blank controls, coverage, genomic distribution, cross-species misallocation, and confirmatory experiments.",
      "report.multiNotice": "Multi-sample comparison is used to identify shared or differential pathogen leads across samples. For formal reporting, batch negative/blank controls, positive controls, coverage, and contamination background libraries are recommended.",
      "report.generated": "Generated: {time} · kraken2-pathogen-report",
      "report.settings": "Settings",
      "report.bgHidden": "Hidden",
      "report.bgShown": "Shown",
      "report.sample": "Sample",
      "report.metricLabel": "Metric",

      // Method text
      "method.text": "A browser-based local pathogen screening tool was used to interpret Kraken2 classification results. The tool reads .k2report files and annotates each taxon against a built-in pathogen knowledge base derived from the national notifiable infectious disease registry of China (500 entries). The database employs a two-tier matching strategy: entries at species rank and below (species/subspecies/isolate/biotype) use exact TaxID matching; entries at genus rank and above (genus/family/species group) use clade-level matching, whereby all descendant species within the designated clade are considered potential pathogen hits. The tool integrates database match status, hazard classification, read distribution, taxonomic rank, and minimizer information to compute an evidence score, classifying results into four tiers: High Priority, Needs Review, Low-Abundance Clue, and Background/Not Reported. All data processing is performed locally in the browser without uploading to any external server, and outputs include interactive HTML reports, multi-sample comparison matrices, and CSV summaries.",

      // Column definitions
      "col.status": "Software-assigned review priority: High Priority, Needs Review, Low-Abundance Clue, or Background. This field indicates the suggested order of downstream review and does not represent a clinical diagnostic conclusion.",
      "col.pathogen": "The taxon name annotated by Kraken2. If the TaxID is in the pathogen database, the Chinese name is also displayed; notes may include TaxID, hazard class, BSL level, associated diseases, transmission routes, and recommended sample types.",
      "col.taxid": "NCBI taxonomy ID, used for multi-sample merging and linking to the pathogen knowledge base.",
      "col.type": "Pathogen category from the database or supplementary rules, e.g. Bacteria, Virus, Fungi, Protozoa, Helminth, Unclassified. This field also affects display ordering.",
      "col.score": "An internal 0-100 score measuring the review priority of the taxon. The score integrates database hits, risk level, clade reads, direct reads, taxonomic rank, minimizer counts, and background penalties. The evidence score is not a probability of positivity, nor a clinical confidence percentage.",
      "col.cladePct": "The proportion of reads assigned to this taxon and all its descendant nodes relative to total reads, from Kraken2 report column 1. It is a tree-cumulative percentage, e.g. a genus clade% includes all reads from its child species.",
      "col.cladeReads": "The number of reads assigned to this taxon and all its descendant nodes. Useful for observing the overall signal of a taxonomic branch, but cannot alone indicate that reads definitively belong to this taxon.",
      "col.directReads": "The number of reads directly assigned to this taxon itself. Compared to clade reads, this value is more suitable for determining whether a clear hit exists; for pathogen screening, direct reads are typically one of the more important pieces of evidence.",
      "col.minimizers": "Only shown when Kraken2 report uses --report-minimizer-data, formatted as distinct minimizers / total minimizers. Distinct minimizers indicate the number of unique minimizers; total minimizers indicate the total count of minimizer hits. More distinct minimizers generally indicate richer evidence distribution; high total but very few distinct minimizers should be interpreted with caution.",

      // Criteria list
      "crit.general": "General Principle",
      "crit.generalDesc": "This software processes pathogen screening results based on Kraken2 .k2report files. Not all taxonomic annotations are reported as pathogens; candidates are first filtered through the notifiable infectious disease pathogen knowledge base, then stratified by reads, taxonomic rank, minimizer information, and sample background.",
      "crit.candidate": "Candidate Scope",
      "crit.candidateDesc": "A taxon enters the key pathogen hits table if: its TaxID matches the notifiable infectious disease database (exact match at species/subspecies/isolate/biotype level); or its ancestor genus/family matches a genus/family-level pathogen in the database (clade branch match); or it matches a user-defined custom pathogen database.",
      "crit.matchLevel": "Match Level",
      "crit.matchLevelDesc": "Genus-level entries indicate all species within the genus are pathogens (e.g. Brucella, Campylobacter), triggering on any species hit; species-level entries match only that specific TaxID. The match level is identified in the database as matchRank: exact/clade.",
      "crit.denoise": "Noise Reduction",
      "crit.denoiseDesc": "Human sequences, synthetic constructs, uncultured or environmental source entries, non-specific classification nodes, commensal or background bacteria mismatched with sample type, and very low-abundance hits with minimal direct reads are typically deprioritized or classified as background.",
      "crit.score": "Evidence Score",
      "crit.scoreDesc": "Each candidate pathogen is assigned a 0-100 evidence score. The score is used for result ranking and review priority, and does not represent a probability of positivity or clinical diagnostic confidence.",
      "crit.scoreSource": "Evidence Sources",
      "crit.scoreSourceDesc": "The evidence score considers database hits, hazard classification (Category I/II/III/IV), whether annotated to a clear species, clade reads, direct reads, distinct minimizers, suspected background/contamination/non-specific hits, and the selected sample type.",
      "crit.critical": "High Priority",
      "crit.criticalDesc": "Indicates the taxon is a Category I or II high-priority pathogen in the database, or has strong reads/minimizer support. Such results should be prioritized for confirmation with coverage, negative/blank controls, related species distribution, and confirmatory experiments.",
      "crit.review": "Needs Review",
      "crit.reviewDesc": "Indicates the taxon has a clear pathogen lead, but evidence strength, hazard class, read counts, minimizer distribution, or sample background are insufficient for high-priority classification. Such results should be evaluated with raw reads, coverage distribution, and control samples.",
      "crit.trace": "Low-Abundance Clue",
      "crit.traceDesc": "Indicates the taxon has low hit counts, or may be an opportunistic pathogen, commensal, background, or low-level contamination source. Such results serve as screening hints and should not be used alone as a positive conclusion.",
      "crit.bg": "Background / Not Reported",
      "crit.bgDesc": "Indicates insufficient evidence, or the taxon is more likely from human, synthetic, environmental/uncultured sources, non-specific classification, or background contamination. Such results are hidden by default.",
      "crit.dedup": "Ancestor Deduplication",
      "crit.dedupDesc": "If a clear species or subspecies hit is already detected, the software hides its parent genus/family hits to avoid duplicate reporting of the same source.",
      "crit.sort": "Display Order",
      "crit.sortDesc": "Parasites/protozoa and helminths are shown first, then viruses, then bacteria; within the same type, results are sorted by evidence score descending, and ties are broken by direct reads descending.",

      // Docs usage
      "docs.fileInput": "File Input",
      "docs.fileInputDesc": "Upload Kraken2 .k2report files, supporting standard 6-column reports and 8-column reports generated with --report-minimizer-data.",
      "docs.singleReport": "Single Sample Report",
      "docs.singleReportDesc": "View a single sample's auto-summary, key pathogen hits table, domain composition, and taxonomy tree browser.",
      "docs.multiCompare": "Multi-Sample Comparison",
      "docs.multiCompareDesc": "Compare pathogen hit status and metrics across samples; exportable as HTML or CSV matrix.",
      "docs.localProcessing": "Local Processing",
      "docs.localProcessingDesc": "All parsing, filtering, and report export is performed locally in the browser; sample files are never uploaded to a server.",
      "docs.reviewAdvice": "Review Advice",
      "docs.reviewAdviceDesc": "Before formal reporting, incorporate negative/blank controls, coverage, genomic distribution, cross-species misallocation, and confirmatory experiments.",

      // Docs DB coverage
      "docs.source": "Built-in Source",
      "docs.sourceDesc": "The current base library is generated from the national notifiable infectious disease registry of China, containing 500 pathogen entries.",
      "docs.matchLevelDb": "Match Level",
      "docs.matchLevelDbDesc": "Entries at species/subspecies/isolate/biotype rank use exact matching (that TaxID only); entries at genus/family/species group rank use clade-level matching (all descendant species are considered pathogen hits).",
      "docs.maintainPage": "Maintainable Page",
      "docs.maintainPageDesc": "Pathogen entries are managed on a dedicated page supporting search, edit, add, CSV/JSON upload/merge, and download.",
      "docs.effective": "Effective Method",
      "docs.effectiveDesc": "Changes saved locally on the management page automatically participate in report interpretation; when switching browsers or computers, download JSON/CSV first and re-import in the new environment.",

      // Docs commands
      "docs.recommendedOutput": "Recommended Output",
      "docs.recommendedOutputDesc": "This tool reads Kraken2 .k2report files. Standard report output with minimizer data enabled is recommended.",
      "docs.paired": "Paired-end Sequencing",
      "docs.single": "Single-end Sequencing",
      "docs.dehost": "Host Depletion for Clinical Samples",
      "docs.paramAdvice": "Parameter Advice",
      "docs.paramAdviceDesc": "--report generates the core file read by this tool; --report-minimizer-data outputs distinct/total minimizers; --confidence 0.05 is suitable for initial screening, more conservative settings can try 0.1; --minimum-hit-groups 3 reduces false positives from isolated matches; --output retains per-read classification for downstream reads extraction and coverage review.",
      "docs.dbAdvice": "Database Advice",
      "docs.dbAdviceDesc": "For routine pathogen screening, Kraken2 PlusPF is recommended; core_nt can supplement broader coverage. Full nt has wide coverage but more redundancy and background hits with higher computational cost, not recommended as default production screening database.",
      "docs.saveAdvice": "Result Storage",
      "docs.saveAdviceDesc": "Backend should retain at least sample.k2report, sample.kraken, sample.log, and sample.run.json. sample.run.json can record database path, Kraken2 version, confidence, minimum-hit-groups, minimizer data flag, host depletion method, and paired/single-end mode.",

      // DB upload notice
      "db.uploadNotice": "Upload note: JSON supports the array format downloaded from this page; CSV should use the template header from 'Download Template'. Static pages cannot directly modify pathogen-db.js; changes on this page are saved to the current browser's local storage.",
      "docs.footerNotice": "Note: Current coverage represents the tool's built-in initial screening rules and does not constitute a complete clinical pathogen knowledge base. It can be replaced with a formal pathogen TaxID database later.",

      // Help tooltips
      "help.status": "Review priority after rule-based stratification: High Priority, Needs Review, Low-Abundance Clue, Background.",
      "help.pathogen": "Taxon name annotated by Kraken2; Chinese name shown if in the built-in database.",
      "help.type": "Rule-based classification: Bacteria, Virus, Fungi, Protozoa, Helminth, etc.",
      "help.score": "Internal 0-100 evidence score integrating database hits, risk level, direct reads, clade reads, species-level annotation, and minimizer counts. Not a probability of positivity.",
      "help.cladePct": "Percentage of reads assigned to this taxon and all descendants relative to total classified/unclassified reads, from Kraken2 report column 1.",
      "help.cladeReads": "Number of reads assigned to this taxon and its descendant nodes.",
      "help.directReads": "Number of reads directly assigned to this taxon itself; typically more suitable than clade reads for determining clear hits.",
      "help.minimizers": "distinct / total minimizers. More distinct minimizers indicate richer evidence distribution; few distinct with high total should be interpreted with caution.",
    },
  },

  t(key, params = {}) {
    const dict = this.dict[this.lang] || this.dict.zh;
    let text = dict[key] ?? this.dict.zh[key] ?? key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
    return text;
  },

  setLang(lang) {
    this.lang = lang;
    localStorage.setItem("k2pr-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    this.applyDom();
  },

  toggleLang() {
    this.setLang(this.lang === "zh" ? "en" : "zh");
  },

  applyDom() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = this.t(el.dataset.i18nTitle);
    });
    document.querySelectorAll("[data-i18n-tip]").forEach((el) => {
      el.dataset.tip = this.t(el.dataset.i18nTip);
    });
    // Dispatch event so app.js / database.js can re-render
    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang: this.lang } }));
  },

  init() {
    document.documentElement.lang = this.lang === "zh" ? "zh-CN" : "en";
  },
};

I18N.init();
