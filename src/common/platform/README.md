<!-- @by oh-my-zerone 2026-09-30 -->

# platform 跨端兼容底层能力

## 一、作用

集中收口 **H5（被原生 App 包裹的网页，可使用 jsBridge）** 与 **微信小程序** 的底层跨端差异，提供统一调用入口，避免 token、header、路由、桥接等逻辑散落在 `auth.js`、`upload.js`、`wallet.js`、`Nav.js`、`uni-plus-funtion.js` 等多处形成多份不一致实现。

**覆盖能力**：平台识别、原生桥接、Token/存储、请求头、导航、定位。

> 注：临时文件转 File（`tempFilePathToFile`）已在 2026-10-09 收敛至上传统一目录 `@/common/upload/file`，本目录 `platform/file.js` 仅做转发垫片。

**设计原则（分层共存）**：

- 底层共享能力统一用运行时 `useGetPlat()` 判定，调用方不感知端差异；
- 形态级差异（文件 `File` 形态、`uni.getLocation` 等 API 在端上不存在）保留 `#ifdef` 条件编译，保证包体积与可用性。

**边界**：本目录只收口「底层能力层」。业务级跨端（契约锁插件、`getUpdateManager`、微信登录 `wx.login`）保留在各自业务目录，不在此处。

## 二、目录结构

```
src/common/platform/
├── platform.js       # 平台识别：useGetPlat / isWx / isH5
├── bridge.js         # 原生桥接：useJsBridge / useJsBridgeAsync / useCanIUseJsBridge / getRawBridge / bridge
├── storage.js        # Token/存储：getToken / setToken / removeToken / getAuthorization / isLogin
├── header.js         # 请求头：getUploadHeaders
├── navigate.js       # 导航：Nav(switchTab…close) + useToLoginView / usePlusNavigateBack / onLoginStatus / onAuthorization
├── location.js       # 定位：getLocationPlus（保留 #ifdef）
└── file.js           # 兼容垫片：转发至 @/common/upload/file（实现已迁移，保留 #ifdef 说明见 upload/file.js）
```

## 三、能力清单与作用

| 模块 | 方法 | 作用 |
| --- | --- | --- |
| `platform` | `useGetPlat()` | 返回 `'wx' \| 'h5'`，结果缓存 |
| `platform` | `isWx()` / `isH5()` | 端判断快捷方法 |
| `bridge` | `useCanIUseJsBridge()` | 是否被原生 App 嵌入、可使用 jsBridge（wx 直接 false） |
| `bridge` | `useJsBridge(params)` | 同步调用原生方法，不支持环境 no-op |
| `bridge` | `useJsBridgeAsync(name, payload)` | 异步调用原生方法，返回 Promise |
| `bridge` | `getRawBridge()` | 获取底层桥接对象（H5/App），替代直接 import `zjz1-h5-ui` 的 `AppBridge` |
| `bridge` | `bridge(params, ...rest)` | 透出底层桥接（兼容 `this.$global.bridge` 约定） |
| `storage` | `getToken()` / `setToken({token})` / `removeToken()` | 登录态读写（H5/App 双写原生桥接与 uni 存储） |
| `storage` | `getAuthorization()` | **统一**鉴权头来源（消除多份不一致实现） |
| `storage` | `isLogin()` | 是否已登录 |
| `header` | `getUploadHeaders()` | 上传类接口统一请求头（平台默认头 + Authorization） |
| `navigate` | `Nav`（default + named） | `switchTab / jumpRouter / redirectTo / back / close`；`close` 原生环境走桥接 `finish` |
| `navigate` | `useToLoginView()` | 跳登录页 |
| `navigate` | `usePlusNavigateBack(object?)` | 带环境判断的返回 |
| `navigate` | `onLoginStatus()` | 登录态校验，未登录弹窗引导 |
| `navigate` | `onAuthorization(url, payload?)` | 带登录校验的跳转 |
| `location` | `getLocationPlus()` | 获取当前位置（保留 `#ifdef`） |
| `file`（已迁移） | `tempFilePathToFile`（default） | 临时路径转 File 描述对象（实现见 `@/common/upload/file`，保留 `#ifdef`） |

> 依赖方向单向无环：`platform ← bridge ← {storage, header} ← navigate`，新模块请勿反向依赖 `navigate`。

## 四、使用方法

**按具体模块 import（无桶文件），不要再散落各业务文件。**

```javascript
// components
// hooks
import { ref } from 'vue';

// const

// services（跨端能力，按模块直连）
import { useGetPlat, isWx, isH5 } from '@/common/platform/platform';
import { useJsBridge, useJsBridgeAsync, useCanIUseJsBridge, getRawBridge } from '@/common/platform/bridge';
import { getToken, setToken, removeToken, getAuthorization, isLogin } from '@/common/platform/storage';
import { getUploadHeaders } from '@/common/platform/header';
import Nav, { useToLoginView, usePlusNavigateBack, onLoginStatus, onAuthorization } from '@/common/platform/navigate';
import { getLocationPlus } from '@/common/platform/location';
import { tempFilePathToFile } from '@/common/upload/file'; // 已收敛至统一上传目录
```

**各能力调用示例：**

```javascript
// 1. 平台识别
if (isWx()) { /* 小程序逻辑 */ }
else if (isH5()) { /* 网页逻辑 */ }

// 2. 原生桥接（同步）
useJsBridge({ name: 'dataStore.putStringValue', payload: { key: 'k', value: 'v' }, isAsync: true });
const token = useJsBridge('getTokenSync'); // v2 平铺写法
// 异步
const loc = await useJsBridgeAsync('getLocation');
// 需直连底层桥接（如替换原 import AppBridge 的场景）
const raw = getRawBridge();

// 3. 登录态 / 鉴权头（统一来源，勿再自有实现）
const token = getToken();
setToken({ token });
const auth = getAuthorization(); // 请求头 Authorization 取这个值

// 4. 上传请求头
const headers = getUploadHeaders(); // { ...默认头, Authorization }

// 5. 导航
Nav.switchTab('/pages/home/index');
Nav.jumpRouter('/pages/detail/index');
Nav.close(); // 原生环境 finish，否则 navigateBack
useToLoginView();
usePlusNavigateBack();
if (onLoginStatus()) { /* 已登录 */ }
onAuthorization('/pages/foo/index', 'id=1');

// 6. 定位
const { latitude, longitude } = await getLocationPlus();

// 7. 临时文件转 File
const file = await tempFilePathToFile(tempFilePath);
```

> **兼容旧调用点**：`uni.useGetPlat()`、`uni.useJsBridge()`、`uni.useToLoginView()` 等历史 `uni.*` 调用仍可用（由 `uni-plus-funtion.js` 薄注册层挂载），但**新代码一律按具体模块 `import`（如 `@/common/platform/storage`）**。

## 五、如何收敛新的跨端能力

当需要新增一处跨端能力（或发现散落的 `#ifdef`/平台判断）时，按以下步骤收敛：

1. **判定归属**：是否为底层共享能力（多端、多业务复用）？业务级强端能力（如新第三方 SDK 插件、`getUpdateManager` 类）**不要**放本目录，留在业务内。
2. **选择范式**：
   - 底层共享能力 → 统一运行时 `useGetPlat()` / `isWx()` / `isH5()` 分支；
   - 形态级差异（API 端上不存在、数据类型不同）→ 保留 `#ifdef`，但实现仍放本目录。
3. **新建子文件**：按能力命名（如 `payment.js`、`clipboard.js`），顶部加 `@by oh-my-zerone` 注释说明作用。
4. **遵守 import 分组**：文件内 `import` 按 `// components` / `// hooks` / `// const` / `// services` 分块；本目录内部只用 `// const`（常量/枚举）与 `// services`（跨端桥接 import）两组，保持与既有文件一致。
5. **控制依赖方向**：只依赖 `platform` / `bridge` / `storage` / `header` 等更底层模块，**禁止反向 import `navigate`**，避免循环依赖（见第三节依赖方向）。
6. **无需接入桶文件**：本目录已移除 `index.js` 统一出口，新模块直接对外，业务按具体模块（含文件名）`import`。
7. **删除旧实现**：移除散落处的重复逻辑，把调用点 `import` 改到具体模块；如需保留 `uni.xxx` 旧调用，只在 `uni-plus-funtion.js` 薄注册层挂载，不要双写实现。
8. **双端验证**：因含 `#ifdef` 与 `process.env` 分支，必须在 **H5** 与 **mp-weixin** 两平台分别构建跑通主流程，**编译通过 ≠ 运行时可用**。
9. **补全文档**：同步更新 `docs/agent/cross-platform.md` 的能力清单（如涉及新模块）。

**约定速记**：底层用 `useGetPlat`、强端用 `#ifdef`、依赖单向无环、调用按模块直连（不走桶文件）、新文件带 `@by oh-my-zerone`。
