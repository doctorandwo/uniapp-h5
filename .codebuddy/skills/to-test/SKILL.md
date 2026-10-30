---
name: to-test
description: 对 PRD、issue 或用户提供的测试内容进行验收回收，确认通过/未通过/待确认状态，输出精简测试回收报告与返工报告。
---

# to-test

@author: laicaijin
@email:lcj970630@gmail.com
@group:oh-my-zerone

## 目标

进行测试回收，确认 PRD TODO、issue 或用户提供测试内容的验收状态。

## 输入来源

优先级：

1. 用户本轮明确指定内容
2. 当前 PRD / issue / TODO
3. `CONTEXT.md` / `CONTEXT-MAP.md`
4. `docs/agent/introduction.md`
5. 相关代码改动摘要或 git diff

说明：`CONTEXT.md` / `CONTEXT-MAP.md` 只允许读取作为上下文知识，禁止创建、更新、维护。

## should do

- 读取指定 PRD、issue 或用户提供的测试内容。
- 整理待验收项。
- 向用户确认测试结果。
- 状态只使用：`通过`、`未通过`、`待确认`。
- 用户明确确认通过后，允许修改对应 PRD / issue TODO 的验收状态。
- 未确认通过的 issue / TODO 禁止打勾。
- 验收不通过时，继续追问到足够交给 `/to-coding`。
- 输出精简的测试回收报告。
- 对未通过项输出精简返工报告。
- 最后提示下一步动作。

## don't

- 不主动运行 `pnpm test`、`pnpm build`、`pnpm lint` 等脚本。
- 除非用户主动提出怎么测试，否则不执行测试命令。
- 不维护 `CONTEXT.md` / `CONTEXT-MAP.md`。
- 不修改需求描述、验收标准、实现方案。
- 不主动修改代码。
- 不创建 PRD / issue。
- 不提交 commit。
- 不自动进入 `/to-coding`。
- 不落盘测试报告。

## 未通过追问信息

至少补齐：

- 失败项
- 页面/入口
- 操作步骤
- 当前表现
- 期望表现
- 影响范围
- 是否稳定复现
- 关联 PRD / issue / TODO

## 输出格式

### 测试回收报告

- 关联对象：
- 通过：
- 未通过：
- 待确认：

### 返工报告

- 返工项：
- 问题：
- 复现：
- 期望：
- 影响：
- 交给 `/to-coding`：

下一步：未通过项可交给 `/to-coding` 返工；全部通过后可进入 `/to-review`。
