---
name: to-ui
description: >
  基于最终 PRD 生成 UI 设计原型 HTML 文件并自动打开预览。当用户要求 to-ui、UI 设计、
  界面原型、页面视觉稿、交互设计，或提到"设计一下"、"画个页面"、"UI 效果"时触发。
  输出独立 HTML 文件到 .UI/ 目录，使用项目 z1-design 设计规范配色，
  Tailwind CSS 快速布局，GSAP 动画增强交互。
---

# UI 原型设计 Skill

## 核心规则

1. **PRD 驱动**：必须基于用户指定的 `.PRD/<version>.md` 生成 UI 原型；未指定 PRD 时，先询问用户使用哪个 PRD 文件
2. **输出位置**：所有设计文件输出到项目根目录 `.UI/` 文件夹下
3. **文件格式**：独立 HTML 文件，CDN 引入所有依赖，零构建直接浏览器打开
4. **自动预览**：文件写入后，使用 `start`（Windows）/ `open`（macOS）命令自动打开；如果无法打开，返回 HTML 文件路径并说明原因
5. **设计语言**：必须与本项目 z1-design 设计系统保持一致
6. **确认门禁**：UI 原型生成后必须等待用户确认，未确认前不得进入 `to-issues`、`to-coding` 或把 UI 方案视为最终实现依据

## 两阶段约定

| 阶段 | 用途 | Tailwind CSS | GSAP |
|------|------|-------------|------|
| **原型设计**（`.UI/*.html`） | 快速验证视觉方案 | ✅ 允许使用 | ✅ 必须使用 |
| **实际还原**（`src/**/*.vue`） | 落地到项目代码 | ❌ 禁止使用 | ✅ 适当使用 |

## PRD 驱动规则

- 必须先读取用户指定的 `.PRD/<version>.md`，并以该 PRD 作为唯一业务需求来源。
- UI 原型不得新增 PRD 未包含的业务能力；如果发现 PRD 缺口，只能列为"UI 设计发现的问题"，等待用户确认是否回写 PRD。
- 每个页面区块、表单字段、按钮、状态、弹窗、表格列都应能追溯到 PRD 的功能清单、Schema、页面交互、扩展性要求或用户故事。
- 如果 PRD 描述不足以确定关键 UI 决策，优先给出推荐方案和待确认点；不要把猜测写成已确认事实。
- 不修改 PRD、不创建 issue、不修改业务源码。`to-ui` 只负责生成 UI 原型和确认清单。

## PRD 到 UI 的映射

读取 PRD 后，按以下顺序提取并映射：

1. **功能清单 TODO**：映射为页面主流程、主要按钮、操作入口和可见模块。
2. **数据模型 Schema**：映射为表单字段、筛选条件、表格列、详情字段、默认值和校验提示。
3. **页面交互**：映射为弹窗、抽屉、确认提示、步骤流、状态切换和反馈信息。
4. **扩展性要求**：映射为可扩展布局、保留入口、配置区或非阻塞说明。
5. **用户故事**：映射为页面信息层级、首屏重点、用户路径和关键转化动作。

## 项目风格探索

生成 UI 前，优先查看仓库中相似页面、组件、demo 或文档，理解项目已有风格：

- 相似业务页面的布局密度、表格/表单/筛选区写法。
- `z1-design` 组件使用方式与视觉节奏。
- `docs/docs/components/` 或 `start/` 中已有 demo 的结构。
- 当前项目常用文案、空状态、错误态、按钮层级和操作区位置。

若无法找到相似参考，在回复中说明"未找到直接参考，按 z1-design 基础规范设计"。

## 状态覆盖要求

UI 原型不得只覆盖正常态。根据 PRD 场景，至少考虑以下状态，并在 HTML 中体现或在回复中说明不适用原因：

- loading：数据加载中、按钮提交中。
- empty：列表无数据、搜索无结果。
- error：接口失败、加载失败、保存失败。
- disabled：无权限、条件不足、按钮不可用。
- success：保存成功、提交成功、复制成功。
- validation：表单必填、格式错误、范围错误。
- overflow：长文本、数据过多、窄屏换行。
- permission：无权限访问或部分操作不可见。

## 设计规范 — 颜色与变量

原型 HTML 中必须使用以下 CSS 变量作为核心配色，保持与项目一致：

```css
:root {
  /* 主色 */
  --primary-color: #3A65FF;
  --primary-color-9: #F2F5FF;

  /* 语义色 */
  --success-color: #21BD88;
  --warning-color: #FAAD14;
  --error-color: #E64B4B;

  /* 文字 */
  --text-color: #323234;
  --text-color-2: #808080;
  --text-color-3: #C0C4CC;

  /* 背景与边框 */
  --default-color-8: #F7F8FA;
  --default-color-9: #FAFAFA;
  --default-color-10: #FFFFFF;
  --text-color-6: #E5E6EB;

  /* 基础 */
  --border-radius-base: 4px;
  --font-size-base: 14px;
}
```

## HTML 模板

每个原型文件使用以下骨架：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UI 原型 — [页面名称]</title>

  <!-- Tailwind CSS（仅原型使用） -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- GSAP 动画 -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

  <style>
    :root {
      --primary-color: #3A65FF;
      --primary-color-9: #F2F5FF;
      --success-color: #21BD88;
      --warning-color: #FAAD14;
      --error-color: #E64B4B;
      --text-color: #323234;
      --text-color-2: #808080;
      --text-color-3: #C0C4CC;
      --default-color-8: #F7F8FA;
      --default-color-9: #FAFAFA;
      --default-color-10: #FFFFFF;
      --text-color-6: #E5E6EB;
      --border-radius-base: 4px;
      --font-size-base: 14px;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
                   "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      color: var(--text-color);
      background: var(--default-color-9);
      margin: 0;
    }

    /* 在此编写页面样式 */
  </style>
</head>
<body>

  <!-- 在此编写页面结构 -->

  <script>
    gsap.registerPlugin(ScrollTrigger);

    // 在此编写 GSAP 动画
  </script>
</body>
</html>
```

## GSAP 动画要求

原型中必须包含合理的 GSAP 动画：

- **页面入场**：使用 `gsap.timeline()` 编排主要区块从下至上渐入，配合 stagger
- **滚动触发**：长页面使用 `ScrollTrigger` 让区块在视口内触发动画
- **Hover 交互**：卡片、按钮等交互元素添加 hover 微动效
- **缓动函数**：优先使用 `power3.out`、`power2.out`、`back.out(1.2)` 等自然缓动
- **性能**：只动画 `transform` 和 `opacity`，利用 GPU 加速

```javascript
// 入场示例
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.from('.hero', { opacity: 0, y: 40, duration: 0.6 })
  .from('.card', { opacity: 0, y: 30, duration: 0.4, stagger: 0.08 }, '-=0.3');

// ScrollTrigger 示例
gsap.from('.section', {
  scrollTrigger: { trigger: '.section', start: 'top 80%' },
  opacity: 0, y: 40, duration: 0.5, stagger: 0.1
});
```

## 设计原则

1. **与项目风格统一**：圆角 4px、主色 #3A65FF、灰阶背景层次分明
2. **信息层级清晰**：标题 > 正文 > 辅助文字，颜色从深到浅
3. **适度留白**：section 间距 20–24px，卡片内距 16–24px
4. **响应式考虑**：使用 Tailwind 的响应断点保证多端适配

## 工作流程

1. 确认 PRD 文件：用户已指定则读取；未指定则询问使用哪个 `.PRD/<version>.md`
2. 读取 PRD 并提取功能清单、Schema、页面交互、扩展性要求、用户故事
3. 探索相似页面、组件、demo 或文档，确定项目风格参考
4. 输出页面结构与关键 UI 决策；若存在高风险假设，先让用户确认
5. 在 `.UI/` 目录创建 HTML 文件，命名格式：`[版本]-[功能名].html`
6. 使用模板骨架 + Tailwind 快速搭建布局
7. 用 CSS 变量保持项目配色一致，并覆盖关键交互状态
8. 添加 GSAP 入场/交互动画
9. 使用 Shell 工具执行 `start .UI/[文件名].html` 自动打开预览；失败时返回文件路径
10. 回复用户来源 PRD、页面结构、主要交互、覆盖状态、PRD 缺口和待确认 UI 决策

## 命名规范

```
.UI/
├── agent-introduce.html    # 智能体介绍页
├── agent-square.html       # 智能体广场
├── dashboard-overview.html # 仪表盘概览
└── chat-interface.html     # 对话界面
```

版本化 PRD 驱动原型推荐使用：

```
.UI/
├── 1.35.0-agent-square.html
├── 1.35.0-dashboard-overview.html
└── 1.35.1-chat-interface.html
```

## 回复格式

生成完成后，回复必须包含：

- **来源 PRD**：`.PRD/<version>.md`
- **原型文件**：`.UI/<version>-<module>.html`
- **页面结构**：列出主要区块和对应 PRD 来源
- **主要交互**：列出按钮、弹窗、状态切换、反馈逻辑
- **覆盖状态**：说明 loading / empty / error / disabled / success / validation 等状态
- **发现的问题**：PRD 中缺少、冲突或需要确认的 UI 信息
- **待用户确认**：确认后才可进入 `to-issues` 或 `to-coding`
