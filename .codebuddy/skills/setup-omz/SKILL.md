---
name: setup-omz
description: 在用户第一次安装 oh-my-zerone 后执行项目初始化扫描。使用当前项目的 AGENTS.md、docs/agent/introduction.md、配置文件和目录结构，自动理解技术栈与项目结构，并生成或补全 docs/agent/introduction.md；只记录技术结构和定位入口，不写业务知识，不运行项目脚本。
---

@author: laicaijin
@email:lcj970630@gmail.com
@group:oh-my-zerone

# Setup OMZ

`/setup-omz` 用于用户首次安装 `oh-my-zerone` 后，对当前项目做一次技术结构初始化扫描，并生成或补全 `docs/agent/introduction.md`。

本 skill 是手动触发能力，不隶属于 `fe-dev`、`fe-locate` 等开发工作流。

## 目标

- 理解当前项目的技术栈、目录结构、工程配置和关键定位入口。
- 让后续 Agent 可以快速判断“配置在哪里、页面在哪里、路由在哪里、接口在哪里、样式在哪里、类型在哪里”。
- 将结果写入 `docs/agent/introduction.md`。
- 输出 setup 报告，说明写入策略、识别摘要、扫描来源和未写入内容。

## 硬边界

### 允许

- 读取 `AGENTS.md`。
- 读取 `docs/agent/permission.md`。
- 读取 `docs/agent/evolution.md`。
- 读取和更新 `docs/agent/introduction.md`。
- 只读扫描项目目录、配置文件、源码入口和 README。
- 基于已有大纲补充技术结构内容。
- 在 `introduction.md` 中写入或更新 `@group:oh-my-zerone` 与 `@last-scan YYYY-MM-DD`。
- 输出 setup 报告。

### 禁止

- 不写业务流程、领域术语解释、角色定义、权限业务含义或业务模块目标。
- 不更新 `CONTEXT.md`。
- 不创建或更新 `docs/knowledge/`。
- 不更新 `docs/agent/memory.md`。
- 不更新 workflow、rules、其他 skill，除非已经按进化机制获得用户确认。
- 不运行 `npm install`、`pnpm install`、`yarn install`。
- 不运行 `npm run build`、`npm test`、`npm run lint`、格式化、代码生成、迁移或任何会改变项目状态的命令。
- 不提交 commit。
- 不覆盖已有实质内容，除非用户确认。

如果发现业务信息，只在 setup 报告里提示“发现业务信息，未写入 introduction.md”。如需沉淀业务知识，应按项目进化机制申请写入 `CONTEXT.md` 或 `docs/knowledge/`。

## 前置读取

执行时先读取：

1. `AGENTS.md`
2. `docs/agent/permission.md`
3. `docs/agent/evolution.md`
4. `docs/agent/introduction.md`

如果权限文件或进化文件不存在，仍可继续扫描，但必须在报告中说明缺失文件和影响。

## 扫描规则

优先读取能判断技术结构的文件：

- README：`README.md`、`README.*`
- 包与脚本：`package.json`、lockfile、workspace 配置
- 构建配置：`vite.config.*`、`next.config.*`、`nuxt.config.*`、`webpack.config.*`、`tsconfig.json`、`jsconfig.json`
- 路由和页面入口：`src/router`、`src/routes`、`src/pages`、`src/app`、`pages`、`app`
- 请求层：`src/api`、`src/apis`、`src/services`、`src/service`、`src/request`、`src/http`
- 状态层：`src/store`、`src/stores`、`src/model`、`src/models`、`src/hooks`
- 类型定义：`src/types`、`types`、`typings`、`*.d.ts`
- 样式入口：`src/styles`、`styles`、`assets/styles`、`tailwind.config.*`、`postcss.config.*`
- 权限或守卫：`permission`、`auth`、`guard`、`middleware`
- 微前端相关：`qiankun`、`single-spa`、`module federation`、`wujie`
- Agent 套件：`AGENTS.md`、`docs/agent`、`rules`、`skills`

根据实际项目动态适配，不强制套前端应用模板：

- 有 `src`，说明 `src` 目录职责。
- 有 `app` / `pages`，说明页面或路由目录职责。
- 有 `packages` / `apps`，说明 monorepo 工作区结构。
- 有 `components`，说明组件目录职责。
- 有 `docs`，说明文档目录职责。
- 有 `rules` / `skills` / `AGENTS.md`，说明 Agent 相关目录职责。
- 没有某类目录时，不硬写空章节。

## 扫描排除

读取 `.gitignore`，并避免扫描明确忽略的大目录。

默认跳过：

- `.git`
- `node_modules`
- `dist`
- `build`
- `.next`
- `.nuxt`
- `coverage`
- `.turbo`
- `.cache`
- 临时产物、日志、压缩包和生成目录

## introduction 写入策略

按以下顺序判断：

1. **空模板**
   - 只有标题、元信息和空章节，或有效内容很少。
   - 可以自动完整写入。

2. **已有大纲但缺内容**
   - 保留用户标题和顺序。
   - 按大纲补充技术结构与技术栈内容。
   - 如果大纲太粗，允许在对应章节下新增二级或三级小节。
   - 如果缺少关键技术定位信息，允许追加补充章节。

3. **已有 setup-omz 管理区块**
   - 如果存在：
     ```md
     <!-- setup-omz:start -->
     ...
     <!-- setup-omz:end -->
     ```
   - 只更新管理区块内部，保留区块外用户内容。

4. **已有实质内容且无管理区块**
   - 不自动覆盖。
   - 暂停并向用户说明覆盖风险，提供拟写入摘要，等待确认。

默认不调整已有标题名称，不重排标题顺序，不删除用户标题。空模板首次生成时可以使用 OMZ 推荐结构。

## 内容规则

`introduction.md` 只记录技术结构和定位信息。

可以写：

- 项目类型与技术栈。
- 包管理器和常用 scripts 名称。
- 顶层目录职责。
- 主要源码目录职责。
- 页面、路由与入口。
- 组件、状态、接口与类型目录。
- 样式体系。
- 构建与工程配置。
- Agent 相关目录。
- 当前技术约束与注意事项。
- 首次阅读建议。
- 扫描来源。

不要写：

- 业务词是什么意思。
- 业务流程如何流转。
- 用户角色的业务定义。
- 权限规则的业务含义。
- 某个模块的业务目标。
- 具体接口的业务语义。

无法确定的信息写在对应正文里，不单独创建“待确认项”章节：

- 找到明确证据：`请求层入口位于 src/services/request.ts。`
- 未发现：`未在常见位置发现统一请求层入口。`
- 有多个候选：`请求层候选位置包括 src/api 与 src/services，需结合具体调用点继续确认。`

## 推荐结构

空模板或没有可用大纲时，参考以下结构。执行时根据实际项目删减或补充，不强制固定：

```md
# introduction 项目介绍

@group:oh-my-zerone
@last-scan YYYY-MM-DD

## 项目类型与技术栈

## 包管理与脚本

## 顶层目录

## 主要源码目录

## 页面、路由与入口

## 组件、状态、接口与类型

## 样式体系

## 构建与工程配置

## Agent 相关目录

## 当前约束与注意事项

## 首次阅读建议

## 扫描来源
```

如果文件已有 `@version`，保留它；如果没有，不强制新增。

## 文档风格

- 索引类信息优先用表格：技术栈、目录职责、关键入口、scripts、扫描来源。
- 说明类信息使用短段落或列表。
- 保持内容面向“后续快速定位文件”，不要写成长篇源码解读。

## 校验

写入后检查：

- `docs/agent/introduction.md` 存在。
- 文件中有 `@group:oh-my-zerone`。
- 文件中有最新 `@last-scan YYYY-MM-DD`。
- 没有写入业务流程、业务术语解释、角色定义或权限业务含义。
- 没有修改 `CONTEXT.md`、`docs/knowledge/`、`docs/agent/memory.md`、workflow、rules、其他 skills。
- 有 `扫描来源` 章节，且列出主要依据文件。
- 如果已有大纲，原有标题顺序未被重排。

不要通过运行项目脚本来校验。

## setup 报告

完成后输出：

```md
## setup-omz 报告

写入结果：
- 已更新 / 未写入 / 等待用户确认

更新策略：
- 空模板自动写入 / 已有大纲补全 / 管理区块更新 / 已有实质内容等待确认

技术栈摘要：
- ...

关键定位入口：
- 路由：
- 页面：
- 接口：
- 状态：
- 样式：
- 配置：

扫描来源：
- `path/to/file`：用途

未写入内容：
- 发现业务信息时说明未写入 introduction.md。

边界：
- 未写业务知识。
- 未更新 CONTEXT.md / docs/knowledge / memory / workflow / rules / 其他 skills。
- 未运行 build/test/lint/install。
- 未提交 commit。
```
