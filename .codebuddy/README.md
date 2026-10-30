# oh-my-zerone

`1.2.0`

`oh-my-zerone`（简称 `omz`）是一套以 SDD（Specification Driven Development，规格驱动开发）范式设计的 Harness Engineering 套件，面向前端团队的 AI Coding 协作流程。

它的核心目标不是绑定某一个 AI 编辑器，而是把「需求澄清、计划、PRD、issue、编码、测试、review、commit / PR」这些协作环节拆成职责清晰、可组合、可追踪的规则与技能，让 Agent 在项目语言、项目文档和既定工作流下稳定推进任务。

## 什么是 oh-my-zerone？

`oh-my-zerone` 是一套服务于 `前端 AI Coding` 的工作流套件。它把一次需求交付中容易失控的部分拆成多个可独立执行的阶段：

- 先澄清需求，避免 Agent 直接写错方向。
- 再沉淀 PRD，减少口头信息丢失。
- 再拆成 issue，让任务可以独立认领、独立验收。
- 再按 PRD / TODOQ 顺序编码，避免范围蔓延。
- 最后通过测试回收、review、commit / PR 收尾。

有以下特点：

- **不限 AI 编辑器**：只要目标工具支持项目级指令、规则文件或可复用 prompt，就可以接入。
- **职责内聚**：每一个 skill / rule / docs 文件只负责一件事，保证可以单独使用，也可以自定义组合使用。
- **高自由度**：内部的 skills 和 rules 低耦合，不强制一次性安装完整流程。
- **SDD 优先**：先把需求规格讲清楚，再进入开发实现，降低从需求到代码之间的信息损耗。
- **人机协作边界明确**：哪些可以 AFK 自动推进，哪些需要 HITL 人工确认，会在流程中明确区分。
- **记忆层沉淀**：通过 `docs/agent/memory.md` 保存经过授权的长期偏好、项目约定和协作规则，让 Agent 后续执行任务时能复用稳定上下文。
- **知识库扩展**：通过 `docs/knowledge/` 沉淀长期有效、可复用的项目事实和背景信息，减少重复解释和临时猜测。
- **自主进化机制**：Agent 可以主动识别值得沉淀的 memory、knowledge、skill、rule 或 docs，但必须遵循 `docs/agent/evolution.md` 的授权边界，禁止未确认写入长期资产。

## 有什么用？

帮助前端同事更稳定、快速地进行 AI Coding。

在没有流程约束时，Agent 容易直接从一句需求跳到代码实现，导致范围不清、术语不一致、验收口径模糊、PRD 和代码脱节。`oh-my-zerone` 的目标是把这些协作环节标准化，让 Agent 按项目语言、项目文档和既定工作流推进任务，减少从需求到代码之间的信息损耗。

同时，`omz` 内置一套常用开发 skills，覆盖需求澄清、UI 设计澄清、计划、PRD、issue、开发、测试、代码质量质检、review、commit / PR 等环节。每个 skill 都保持内聚和低耦合，开发者可以根据自身需要单独安装或组合使用。

适合解决的问题包括：

- 需求描述比较散，需要先被整理成结构化规格。
- 组件或页面改动涉及 API、交互、文档、类型、测试等多个环节。
- 团队希望 AI Agent 不跳步骤、不越权、不随意重构。
- 开发前需要明确 TODO，开发后需要逐项验收。
- 希望从代码质量角度检查命名、封装、边界处理、性能风险和优化空间。
- 希望交付前有稳定的 review 和 commit message 生成方式。

## 怎么安装？

### 1. 先确保安装zerone/cli 的0.6.0版本及以上
```
npm install -g @zerone/cli --registry=http://10.0.0.74:8081/repository/npm-group/
```
### 2. 安装omz
```powershell
 zerone setup omz
```
### 3. 配置omz
1. 将目录下中的 `AGENTS.md` 放到目标项目根目录，作为 Agent 的项目级协作规范。
2. 将 `docs/agent/` 复制到目标项目，用于保存项目介绍、权限、工作流、review 规范、进化机制等说明。
3. 将 `rules/` 复制到目标项目，用于约束编码规则，例如 `.codex/rules/coding.mdc` 或 `.cursor/rules/coding.mdc` 或 `.trae/rules/coding.mdc`。
4. 按需要将 `skills/` 中的具体 skill 安装到你的编辑器对应的目录下 如 `.codex/skills/` 或 `.cursor/skills/` 或 `.trae/skills/`。
5. 在对话中显式使用 skill 名称，例如 `/to-prd`、`/to-coding`、`/to-review`。

### 4. 首次 setup

安装和配置完成后，建议先在目标项目中手动执行：

```text
/setup-omz
```

`setup-omz` 会扫描当前项目的技术栈、目录结构、工程配置和关键定位入口，并生成或补全 `docs/agent/introduction.md`。它只维护项目技术结构地图，不写业务知识，不更新 `CONTEXT.md` 或 `docs/knowledge/`，也不运行 build / test / lint / install 等项目脚本。

推荐最小安装组合：

```text
AGENTS.md
docs/agent/permission.md
docs/agent/workflow.md
docs/agent/review.md
rules/coding.mdc
skills/setup-omz
skills/grill-with-docs
skills/grill-me-ui
skills/to-prd
skills/to-coding
skills/to-test
skills/to-quality-review
skills/to-review
skills/to-commit
```

如果只想使用部分能力，也可以只安装单个 skill。例如只想把讨论整理成 PRD，可以只接入 `to-prd`；只想做只读审查，可以只接入 `to-review`。

## 什么时候使用

以下场景适合使用 `oh-my-zerone`：

- 新增功能，需要先对齐需求和设计。
- 优化已有功能，需要把想法沉淀成可执行任务。
- 希望把一段讨论整理成 PRD。
- 希望把 PRD 拆成可独立认领和验收的 issue。
- 希望 Agent 严格按 PRD / TODOQ 逐项开发。
- 希望在交付前做测试回收或只读 review。
- 希望对已写代码做建议型质量质检，而不是硬性验收。
- 希望在发版前检查 issue、changelog 和版本信息。
- 希望生成规范的 commit message 或 PR 描述。

不一定需要完整流程的场景：

- 简单文档修正。
- 单个错别字、注释或 README 调整。
- 明确无业务影响的样式微调。

即使是小需求，只要涉及组件 API、交互行为、类型声明、文档、测试或发版，仍建议至少沉淀 PRD 或 issue，避免范围不清。

## 套件内容介绍

`oh-my-zerone` 是服务于 `前端 AI Coding` 研发流程的一组 rules、skills 和 agent docs。它把一次需求交付拆成多个明确阶段：

```text
需求澄清
→ 建立计划
→ PRD 沉淀
→ issue 切片
→ 编码实现
→ 测试回收
→ 代码质量质检
→ review 审查
→ 发版确认
→ commit / PR 收尾
```

团队成员不需要记住所有内部细节，只需要知道在什么阶段使用哪个 skill，以及每个 skill 会交付什么产物。

### AGENTS.md

`AGENTS.md` 是项目级 Agent 协作入口，定义 Agent 在当前项目中的角色、权限、工作流、确认机制和可用 skills。

它主要负责：

- 说明 Agent 的角色：自主进化、严格执行 SDD 范式、对项目全周期负责。
- 规定用户确认机制：哪些步骤必须暂停等待用户确认，哪些可以在用户授权下自动执行。
- 指向核心文档：`docs/agent/workflow.md`、`docs/agent/permission.md`、`docs/agent/introduction.md`、`docs/agent/evolution.md`。
- 声明可用 skills：例如 `to-prd`、`to-coding`、`to-test`、`to-review`、`to-commit`。

建议每个接入 omz 的项目都保留一份 `AGENTS.md`，并根据项目实际情况补充项目特有约束。

### Agent Docs 文档

`docs/agent/` 用来保存 Agent 执行任务时需要读取的项目级说明。

- `introduction.md`：项目定位、技术栈、目录职责、页面结构、路由、样式体系和首次阅读建议。
- `workflow.md`：SDD 开发工作流，定义从询问、需求整理、切片、开发、测试、审查到提交的阶段规则。
- `permission.md`：权限边界，声明禁止做的事和需要用户授权的事。
- `review.md`：review 规范，定义全局检查项、阻塞规则、人工确认项和输出格式。
- `evolution.md`：自主进化授权机制，约束何时可以沉淀 memory、knowledge、skill 或 rule。
- `memory.md` / `evolution-log.md`：用于记录经过授权的长期记忆和进化记录。

### Memory 与 Knowledge

`omz` 将 Agent 的长期上下文拆成两层：

- **Memory 记忆层**：记录用户长期偏好、协作规则、项目约定和经过确认的决策性信息，适合保存短、准、长期有效的执行依据。
- **Knowledge 知识库**：记录项目事实、领域背景、业务模型、历史决策说明等可复用知识，适合保存需要被多次引用的上下文材料。

记忆可以在授权规则允许的范围内由 Agent 自主更新；知识库属于更重的长期资产，新增或更新前需要按 `docs/agent/evolution.md` 发起进化申请并等待用户确认。

### Evolution 自主进化

`omz` 支持 Agent 在项目全周期中持续进化，但进化不是随意自改。Agent 只能主动识别机会、整理证据和提出申请；是否落盘、写入哪里、影响哪些长期资产，都必须遵循权限边界。

典型进化对象包括：

- `docs/agent/memory.md`：沉淀长期记忆。
- `docs/knowledge/`：沉淀项目知识库。
- `skills/`：沉淀可复用任务能力。
- `rules/`：沉淀长期执行规则。
- `docs/agent/evolution-log.md`：记录已经完成的进化动作。

这样可以让 Agent 随着项目推进逐步理解团队语言、业务背景和协作习惯，同时避免未经授权地修改规则、扩大权限或把一次性猜测写成长期事实。

### Rules 规则

规则用来约束 Agent 执行任务的过程和输出结果。相比 skill，rule 更偏向长期、全局、强约束。

#### coding.mdc

编码规则，当前主要约束：

- AI 生成代码需要添加 `@by oh-my-zerone` 标记。
- Vue `<script>` / `<script setup>` 中的 import 需要按 `components`、`hooks`、`const`、`services` 分组。
- 新增分组放在 `services` 之后，并保持同目录风格一致。

当使用 `/to-coding` 进入编码阶段时，应遵循该规则。

### Skills 技能

skills 是可独立触发的工作单元，每个 skill 只负责一个阶段。

#### setup-omz

安装 `oh-my-zerone` 后的首次项目 setup。

它会扫描当前项目的技术栈、目录结构、工程配置和关键定位入口，并生成或补全 `docs/agent/introduction.md`。该 skill 只记录技术结构和后续定位入口，不写业务知识，不更新 `CONTEXT.md` / `docs/knowledge/`，也不运行项目脚本。

#### grill-me

持续追问方案细节，帮助需求对齐。

适合在没有项目文档约束、只想对某个想法进行纯追问时使用。它会一题一题地追问，并为每个问题提供推荐答案。

#### grill-with-docs

结合项目上下文、领域模型和 ADR 压测方案。

适合需要把方案放回项目语言里审视时使用。它会优先查阅代码和文档，检查术语是否冲突、领域边界是否清晰，并在需要时提出 CONTEXT 或 ADR 的沉淀建议。

#### grill-me-ui

在 UI 开发前澄清界面呈现效果，并输出可交接的 UI 设计报告。

适合用户已有原型、截图、数据、需求或页面想法，但还需要明确页面结构、信息层级、交互状态、视觉规则和验收口径时使用。它会先确认本次设计是 `结合现有 UI` 还是 `独立设计`；如果用户已经说明模式，则跳过该问题。

`grill-me-ui` 只做只读分析和一问一答式澄清，不生成 `.UI/` 原型文件、不修改代码、不创建 PRD/issue。最终报告会包含可交给 `/to-locate` 或 `/to-coding` 的任务描述。

#### to-prd

把上下文整理成标准 PRD。

适合在需求已经基本明确后使用。它会把现有上下文整理为 `.PRD/<version>.md`，包含概述、功能清单 TODO、数据模型、页面交互、扩展性要求和用户故事。

#### to-plan

在用户澄清并确认最终需求后，整理本次工作的计划和待办清单。

输出内容包含目标确认、待办清单、依赖关系、风险阻塞和建议下一步。每项待办会标注优先级、简易程度、AFK 值和验收方式。

#### to-issues

把计划、规格或 PRD 切分为可独立认领的 issue。

它采用垂直切片方式拆分任务，优先保证每条 issue 都能形成一条可验证的端到端路径，而不是只按 UI、接口、类型等水平层次拆分。

#### to-coding

基于指定 PRD 或 TODOQ 逐项进行编码开发。

核心约束：

- 按 PRD 中 `- [ ]` TODOQ 从上到下执行。
- 同一时间只聚焦一条未完成项。
- 不做 PRD 之外的内容。
- 未经用户验收，不擅自把 PRD 中的 TODO 勾选为完成。
- 完成单条 TODO 后停止推进，等待用户验收。

#### to-test

进行测试回收与验收。

它会先基于 `.ISSUES` 中各工单的验收标准做切片级验收，再对照 `CONTEXT.md` 或项目验收标准做整体验收。涉及真实交互体验、视觉还原、业务语义的部分需要用户确认。

#### to-quality-review

对指定代码范围进行只读静态代码质量质检。

适合检查命名是否清晰、是否过度封装、函数职责是否过重、边界处理是否完善、是否存在性能风险、类型是否过宽、是否有可维护性和可读性优化空间。

`to-quality-review` 会先结合 `CONTEXT.md`、`CONTEXT-MAP.md`、`docs/knowledge/`、`docs/agent/introduction.md` 和 `rules/coding.mdc` 判断项目已有决策，避免对已确认的架构取舍反复告警。它只输出分级建议报告，不输出 `通过` / `不通过`，不运行项目脚本，不修改代码。

建议分级包括：

- `强烈建议修改`
- `建议修改`
- `可选优化`
- `上下文豁免`
- `未确认`

当建议改法触及框架、底层、公共能力或跨模块契约时，它会提示先进入 `/grill-me` 确认方案，避免直接修改影响其他模块。


#### to-review

对本次改动进行只读 review 审查。

它会读取 `docs/agent/review.md` 和用户提供的「本次 review 清单」，按检查项输出 `通过` / `未通过` / `待确认`。该 skill 默认不修改文件、不提交代码、不勾选 issue。

#### to-commit

生成符合 commitlint 风格的 commit message，并可生成 PR 描述模版。

commit message 格式：

```text
[type]([module]): 简短描述
```

例如：

```text
docs(readme): 完善套件使用手册
feat(button): 新增 loading 状态支持
fix(table): 修复空数据时崩溃问题
```

PR 描述会包含本次改动说明、AI 辅助声明、开发者自查清单和风险说明。

## 推荐工作流

### 完整功能开发

```text
/grill-with-docs
→ /grill-me-ui（如需先确认 UI 呈现效果）
→ /to-prd
→ /to-issues
→ /to-coding
→ /to-test
→ /to-quality-review（如需代码质量建议）
→ /to-review
→ /to-commit
```

适合新增功能、复杂组件、会影响 API / 交互 / 类型 / 文档 / 测试的任务。

### 现有功能修复和优化

对于临时性调整或BUG修复等场景，往往不需要/grill-with-docs这样的澄清过程。
可以使用 `/to-locate` 可以帮助我们快速定位需要调整的文件，并给出证明报告。确认没问题后直接交给 `/to-coding` 执行即可。

```text
/to-locate
→ /to-coding
→ /to-test
→ /to-quality-review（如需代码质量建议）
→ /to-review
→ /to-commit
```

### UI 方案澄清后开发

```text
/grill-me-ui
→ /to-locate（已有页面需要先定位改哪里）
→ /to-coding
→ /to-test
→ /to-quality-review（如需代码质量建议）
→ /to-review
```

适合已有原型、截图或数据，需要先明确 UI 效果，再交给定位或开发阶段的场景。如果只是根据 PRD 生成可预览的 HTML 原型，应使用 `/to-ui`。

### 已有需求转 PRD

```text
/to-prd
→ /to-issues
→ /to-coding
```
适合已经有设计文档、会议纪要、需求描述，但还没有结构化 PRD 的场景。
如果需求只提供了部分材料，建议以 `/grill-me` 或 `/grill-with-docs` 进行需求澄清，再使用 `/to-prd` 生成 PRD。

### 只做交付前检查

```text
/to-test
→ /to-quality-review（如需代码质量建议）
→ /to-review
→ /to-commit
```

适合代码已经完成，需要做验收回收、只读审查和提交收尾的场景。

### 只做代码质量质检

```text
/to-quality-review
```

适合代码已经完成，想从建议角度检查命名、封装、边界处理、性能风险、类型质量和可维护性，但不需要硬性 `通过` / `不通过` 结论的场景。

### 只做文档或小修

```text
直接说明目标
→ Agent 按权限规则修改任务内文件
→ 必要时使用 /to-review 或 /to-commit
```

适合 README、注释、说明文档等低风险变更。

## 示例用法

常见使用方式：

```text
/setup-omz
请扫描当前项目，补全 docs/agent/introduction.md。
```

```text
/grill-with-docs 帮我设计一个高级筛选组件，先 grill 一下需求。
```

```text
/grill-me-ui 我有一张筛选面板原型，结合现有 UI 帮我确认最终呈现效果，并输出设计报告。
```

```text
/to-prd 根据这个组件设计文档生成 PRD。
```

```text
/to-issues 把这个 PRD 拆成可执行 issues。
```

```text
/to-coding 按 1.35.0.md 的 PRD 开发第一项 TODO。
```

```text
/to-test 对本次改动执行测试回收。
```

```text
/to-quality-review 对当前 git diff 做代码质量质检。
```

```text
/to-review 执行 review 审查。
```

```text
/to-commit 按照修改范围生成 commit message 和 PR 描述。
```

也可以组合使用：

```text
我现在要做一个 Select 组件的远程搜索增强。
先 /grill-with-docs 澄清需求，确认后 /to-prd 生成 PRD。
```

## FAQ

### 1. Skill 没有触发怎么办？

可以显式使用 skill 名称，例如 `/to-prd`、`/to-coding`、`/to-test`、`/to-quality-review`。如果任务描述比较模糊，先说明目标阶段，例如：

```text
我现在要把需求整理成 PRD。
```

或：

```text
我现在要按 PRD 开发第一项 TODO。
```

### 2. 什么时候用 `grill-me`，什么时候用 `grill-with-docs`？

如果只是对一个方案持续追问，使用 `grill-me`。

如果需要结合仓库已有领域模型、上下文文档、代码现状或 ADR 来压测方案，使用 `grill-with-docs`。

简单理解：

- `grill-me`：偏通用追问。
- `grill-with-docs`：偏项目内追问和文档对齐。

### 3. 什么时候用 `grill-me-ui`，什么时候用 `to-ui`？

如果还没有确定 UI 方案，使用 `grill-me-ui`。它负责追问和确认 UI 呈现效果，最终输出设计报告，方便后续交给 `/to-locate` 或 `/to-coding`。

如果已经有明确 PRD，并希望生成可打开预览的 HTML 原型，使用 `to-ui`。它负责产出 `.UI/*.html` 原型文件。

### 4. 小需求也必须走完整流程吗？

不一定。

简单文档修正、单点样式修复、明确无副作用的小调整可以直接处理。只要涉及组件 API、交互行为、类型声明、文档、测试或发版，建议至少沉淀 PRD 或 issue，避免范围不清。

### 5. issue 没全部完成能不能发版？

不建议。

`release-after-issues` 的职责就是在更新 changelog 和版本前检查 `.ISSUES/` 是否全部完成。若仍有未完成项，应先回到 `/to-coding` 或重新讨论需求范围。

### 6. 测试通过后谁来确认？

Agent 可以做静态检查、文档检查、规则检查和流程回收。

涉及真实交互体验、视觉还原、业务语义、发布确认时，需要用户或团队成员人工验收。未经过人工确认的 HITL 项，Agent 不应擅自标记为通过。

### 7. Agent 可以自动修改 skill、rule 或知识库吗？

不能默认自动修改。

如果任务过程中发现值得长期沉淀的 skill、rule、docs、memory 或 knowledge，需要按 `docs/agent/evolution.md` 发起进化申请，并等待用户确认。未经授权，不应直接写入这些长期资产。

### 8. 可以只使用某一个 skill 吗？

可以。

`omz` 的设计目标之一就是低耦合。你可以只使用 `/to-quality-review` 做代码质量质检，只使用 `/to-review` 做硬性审查，只使用 `/to-commit` 生成提交信息，或只使用 `/to-prd` 生成 PRD。

### 9. 和普通 prompt 模版有什么区别？

普通 prompt 更像一次性指令，适合临时任务。

`oh-my-zerone` 更像项目内的协作协议：它把权限、流程、文档、验收、review 和提交方式都固化下来，让 Agent 每次都能按同一套规则工作。

## Changelog 更新日志

### 1.2.0

- 新增 `to-quality-review` skill：支持对指定范围进行只读静态代码质量质检，结合项目上下文输出分级建议报告。

### 1.1.0

- 新增 `grill-me-ui` skill：支持基于原型、截图、数据或需求进行 UI 呈现效果澄清。
