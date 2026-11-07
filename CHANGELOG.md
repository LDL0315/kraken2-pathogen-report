# CHANGELOG

本文件记录 kraken2-pathogen-report 项目的代码修改。

## [2026-11-07] 疟原虫属 TaxID 错配修复（恶性疟原虫漏报问题）

### 问题
用户测试 2610250153-ntcore.k2report 时发现文件中有 Plasmodium falciparum 片段（物种级 direct reads 110/118）但报告未显示。诊断确认：**软件匹配逻辑正常，根因是知识库数据错误**——"疟原虫属"条目的 TaxID 误用为 5855（实为三日疟原虫 P. malariae 物种级 TaxID），而 Plasmodium 属的正确 TaxID 是 5820。属级 clade 条目挂错 TaxID，导致只覆盖 P. malariae 子树，覆盖不了恶性疟（5833，Laverania 亚属下）、间日疟（5821）等其他疟原虫。

### 修复
`pathogen-db.js` 三处同步修正（5855 → 5820）：
- `PATHOGEN_CLADE_TAXIDS` 集合
- `MONITORING_TAXIDS` 集合（疟疾为监测传染病）
- `SHENZHEN_PATHOGENS` 条目本身（zh=疟原虫属，type=寄生虫/原虫，severity=high，matchRank=clade，quarantineDisease=疟疾，元数据不变）

### 验证
- Node 诊断：P. falciparum 命中 critical 100 分、3D7 critical 94 分，均进入 visible 列表前 2 位
- 浏览器实测（Playwright 上传该文件）：表格第 1 行即 Plasmodium falciparum（重点关注 100/100，118 reads）
- 120 文件回归：critical 2625 → 2642（+17 全部为新增疟原虫命中，属预期修复），每样本 critical 中位数 18 不变，无其他副作用
- 附带效果：P. vivax/malariae/ovale/knowlesi 等其他疟原虫现均被属级条目覆盖

### 经验
新增/维护知识库条目时，中文名（属/科）与 TaxID 必须与 NCBI 实际分类核对——元数据字段（ncbiName/ncbiRank）写得正确但 TaxID 错配的情况，静态扫描无法发现，需以 NCBI taxonomy 为准核对。另：clade 条目必须带 `type` 字段，否则其下物种命中落入"待分类"排序垫底。

## [2026-10-25] 知识库 NCBI 分类断层修复（病毒漏报问题）

### 问题
用户测试 HONG-261015G-DPC/RPC 两份 .k2report 时发现部分病毒未显示。经浏览器实测 + Node 诊断验证：软件匹配逻辑正常（能匹配的病毒均正常显示），漏报根因是**知识库条目与 NCBI taxonomy 新节点之间存在断层**——名录用旧占位节点（species/isolate 级 exact 条目），Kraken2 nt 库已改用新种/属节点，精确匹配失败：

| 报告节点 | reads | 名录条目 | 断层原因 |
|---------|-------|---------|---------|
| Influenza B virus (11520) | 19 | 11309 "unidentified influenza virus" (exact) | 占位条目匹配不到新种 |
| Mastadenovirus 腺病毒属 (10509) | 32 | 10535 "unidentified adenovirus" (exact) | 匹配不到属节点 |
| human RSV (11250) | 2 | 12814 "Respiratory syncytial virus" (旧 isolate) | 旧节点匹配不到新种 |

（噬菌体 Caudoviricetes、禽喉气管炎病毒等未显示为合理设计——非人病原，名录不收录）

### 修复
`pathogen-db.js` 补充 4 个条目衔接断层（均带 type=病毒，避免落入"待分类"排序垫底）：

| TaxID | 条目 | matchRank | 说明 |
|-------|------|-----------|------|
| 10509 | 腺病毒属 Mastadenovirus | clade | 衔接 10535，覆盖人腺病毒 A~G |
| 11308 | 正粘病毒科 Orthomyxoviridae | clade + monitoring | 衔接 11309 监测意图，覆盖甲/乙/丙/丁型流感 |
| 1868215 | 肺病毒属 Orthopneumovirus | clade | 覆盖 RSV A/B 各型 |
| 11250 | 呼吸道合胞病毒 | exact | 衔接旧节点 12814 |

`PATHOGEN_CLADE_TAXIDS` 同步新增 10509/11308/1868215（113→116），头部注释与 META 计数更新（502→506 条）。

### 验证
- 浏览器（Playwright）实测：RPC 样本表格前 7 行全为病毒——Influenza B virus 重点关注 100 分、RSV 低丰度线索 53 分等均正常显示；DPC 样本 Mastadenovirus（腺病毒属）需复核 61 分显示
- 120 个测试文件回归：critical 2625 不变，总命中 +9（新增条目命中），无副作用
- 数据库完整性检查通过（clade 集合与 DB 一致，无缺失）

### 修改文件
- `pathogen-db.js`：4 个补充条目 + clade 集合 + 头部注释

## [2026-08-06] 病原体判定逻辑优化

### 修复

**P0 重复 TaxID 元数据覆盖丢失（数据层）**
- `applyPathogenRecord()` 改为合并模式：同一 TaxID 多来源条目（名录内部重复 + 用户自定义库）合并而非覆盖
- 合并优先级：检疫/监测身份 > severity 高者 > 用户自定义库 > 名录先到者（xlsx 首个规范名）
- 空字段互补，备注拼接保留溯源
- 修复案例：taxid 1773 结核分枝杆菌（high/监测）不再被龟分枝杆菌（medium）覆盖；263 土拉弗朗西斯菌、11089 黄热病毒、11292 狂犬病街毒、11309 高致病性禽流感、3052303 LCMV 等同理恢复高优先级元数据

**P1a clade-ancestor 物种命中 severity 降级（判定层）**
- 物种经属/科祖先匹配时，属级危害程度不再直接继承到种级，自动降一级（high→medium→low）
- 背景：属内并非所有种都是病原（Brucella anthropi/intermedia 实为环境菌 Ochrobactrum），
  旧逻辑导致环境/机会致病种蹭属级 high severity
- 检疫/监测传染病除外（名录强制要求最高层级分类）

**P1b clade-ancestor 物种命中判读等级封顶（判定层）**
- 非检疫/监测的种级祖先匹配，status 上限为「需复核」
- 「重点关注」保留给三类命中：species 精准匹配且证据分较高、检疫/监测传染病（任何丰度）、
  属/科级直接命中且 reads 支持充分
- 信息不丢失：被封顶的命中仍以「需复核」展示

**P2 近缘种 reads 分配不确定提示（显示层）**
- `annotateAmbiguousSiblings()`：同一父节点下多个物种各有 ≥5 direct reads、
  且最高 reads 物种占比 <60% 时，在备注中追加分配不确定提示
- 典型案例：Aeromonas enteropelogenes/dhakensis/veronii 三菌分摊、
  Enterobacter cloacae complex 7 个种分摊、Staphylococcus aureus/epidermidis、
  同一物种不同菌株节点（Streptococcus parasanguinis ATCC 15912/FW213）
- 浅拷贝实现，不污染 pathogenHits 原数据；先检测后按 Top N 截断，
  组内任一成员进入 Top N 即可见提示

### 效果（120 个测试文件，5 组 confidence）

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| critical 总数 | 6418 | 2625（-59%） |
| 非检疫 clade-ancestor critical | 3166 | 0 |
| 每样本 critical 中位数 | 40 | 18 |
| 每样本 critical 最大值 | 259 | 64 |
| 检疫/监测 critical | 740 | 740（保持） |
| exact 匹配 critical | 1703 | 1704（保持） |

### 文档同步
- `criteriaHtml()`（判读标准，下载报告与判读说明页共用）新增：
  属级 severity 继承规则、近缘种分配提示两节；重写「重点关注」「需复核」定义

### 修改文件
- `app.js`：applyPathogenRecord/mergePathogenRecords（P0）、annotatePathogen severity 降级 +
  status 封顶（P1）、getVisibleHits/annotateAmbiguousSiblings（P2）、criteriaHtml 文档同步

### 验证方式
- Node 诊断脚本加载真实 app.js/pathogen-db.js/i18n.js，解析全部 120 个 .k2report，
  对比修复前后状态分布、命中来源、典型物种判定
- 自定义库合并优先级单测（同分 custom 优先、低优先级自定义被名录压制）
- 浅拷贝无污染验证

## [2026-08-05] 紧凑热力图、病原体筛选面板、minDirect 单元格级阈值

### 新增
- 紧凑热力图模式：样本列 50px、缩写 S1/S2...、样本编号对照表、颜色图例、紧凑/详细视图切换
- 病原体筛选面板：标签芯片（判读等级圆点+名称+类型）、全选/取消全选、计数器、
  选择实时同步矩阵、加载新文件自动重置
- 病原体名称完整显示：详细视图 taxon 列允许换行、紧凑视图加宽至 220px

### 修复
- `最低 direct reads` 阈值此前只在 taxa 收集阶段生效，矩阵单元格直接搜索未过滤列表。
  在 4 处（详细矩阵、紧凑矩阵、CSV 导出、HTML 报告）增加
  `rawHit.row.directReads >= state.minDirect` 校验，低于阈值的单元格显示灰色「-」

### 修改文件
- `app.js`、`styles.css`、`i18n.js`、`index.html`
