# 07 · 主题系统(S10 末期)

> 6 套玻璃拟态主题:`professional / midnight / compact / sunset / cyber / purple`。
>
> 在所有业务功能完成、回归通过后再做,避免反复返工。Codex 实施 S10 时按本文执行。
>
> commit message:`[T-XXX] <type>(theme): <subject>`

---

## 1. 设计原则

1. **CSS 变量驱动**:全部主题基于一套 CSS 变量(根 `:root[data-theme="..."]`),不引入 daisyUI / 多套 SCSS 编译,避免依赖膨胀
2. **与 Element Plus 协同**:覆盖 EP 的部分 CSS 变量(`--el-color-primary` 等),保证组件视觉与主题一致
3. **玻璃拟态(glassmorphism)**:核心特征 `backdrop-filter: blur()` + 半透明 + 柔和阴影 + 圆角
4. **持久化**:`localStorage` + `app.theme` store 双存,刷新保留
5. **无闪烁**:在 `index.html` 的 `<head>` 内联同步脚本,在 Vue 应用挂载前就把 `data-theme` 设到 `<html>` 上
6. **可拓展**:6 套之外允许第三方再加主题,只要按变量约定填一份即可
7. **仅 Web 端做 6 套**;移动端只做浅色/深色/跟随系统(由 05 文档 T-806 实现)

---

## 2. CSS 变量约定

每套主题必须定义以下变量(完整集合)。命名前缀 `--nap-`,以避免与 Element Plus / Tailwind 冲突。

```scss
// apps/fronted/src/styles/themes/_tokens.scss
:root,
:root[data-theme="professional"] {
  /* ============ 品牌色 ============ */
  --nap-primary:           #2563eb;
  --nap-primary-hover:     #1d4ed8;
  --nap-primary-active:    #1e40af;
  --nap-primary-soft:      rgba(37, 99, 235, 0.12);

  --nap-success:           #16a34a;
  --nap-warning:           #ea580c;
  --nap-danger:            #dc2626;
  --nap-info:              #0891b2;

  /* ============ 中性色 ============ */
  --nap-bg-app:            #f5f7fb;          /* 整体应用背景 */
  --nap-bg-elev-1:         rgba(255,255,255, 0.78);   /* 卡片/面板,玻璃态 */
  --nap-bg-elev-2:         rgba(255,255,255, 0.92);   /* 弹窗 */
  --nap-bg-mask:           rgba(15, 23, 42, 0.4);
  --nap-bg-sidebar:        rgba(255,255,255, 0.85);
  --nap-bg-navbar:         rgba(255,255,255, 0.7);
  --nap-bg-tag:            rgba(37, 99, 235, 0.08);

  --nap-text-primary:      #0f172a;
  --nap-text-regular:      #334155;
  --nap-text-secondary:    #64748b;
  --nap-text-placeholder:  #94a3b8;
  --nap-text-inverse:      #ffffff;

  --nap-border:            rgba(15, 23, 42, 0.08);
  --nap-border-strong:     rgba(15, 23, 42, 0.16);

  /* ============ 玻璃态参数 ============ */
  --nap-glass-blur:        18px;
  --nap-glass-saturate:    1.4;
  --nap-glass-shadow:      0 8px 24px rgba(15, 23, 42, 0.08);
  --nap-glass-border:      1px solid rgba(255, 255, 255, 0.6);

  /* ============ 圆角 ============ */
  --nap-radius-sm: 6px;
  --nap-radius-md: 10px;
  --nap-radius-lg: 14px;
  --nap-radius-xl: 20px;

  /* ============ 间距 ============ */
  --nap-spacing-xs: 4px;
  --nap-spacing-sm: 8px;
  --nap-spacing-md: 16px;
  --nap-spacing-lg: 24px;
  --nap-spacing-xl: 32px;

  /* ============ 字号 / 行高 ============ */
  --nap-font-sm: 12px;
  --nap-font-md: 14px;
  --nap-font-lg: 16px;
  --nap-font-xl: 20px;
  --nap-line-relaxed: 1.6;
  --nap-line-tight:   1.2;

  /* ============ 渐变背景(欢迎页 / 登录页) ============ */
  --nap-gradient-aurora:
    radial-gradient(120% 60% at 0% 0%, rgba(37,99,235,0.18) 0%, transparent 60%),
    radial-gradient(120% 60% at 100% 100%, rgba(56,189,248,0.18) 0%, transparent 60%),
    linear-gradient(135deg, #f5f7fb 0%, #e0e7ff 100%);

  /* ============ Element Plus 桥接 ============ */
  --el-color-primary: var(--nap-primary);
  --el-color-success: var(--nap-success);
  --el-color-warning: var(--nap-warning);
  --el-color-danger:  var(--nap-danger);
  --el-color-info:    var(--nap-info);
  --el-bg-color:      var(--nap-bg-elev-1);
  --el-text-color-primary:   var(--nap-text-primary);
  --el-text-color-regular:   var(--nap-text-regular);
  --el-text-color-secondary: var(--nap-text-secondary);
  --el-border-color:        var(--nap-border);
  --el-border-color-light:  var(--nap-border);
  --el-fill-color-blank:    transparent;
  --el-box-shadow-light:    var(--nap-glass-shadow);
}
```

剩余 5 套通过 `:root[data-theme="midnight"] { ... }` 同结构覆盖,**不引入新变量名**,只换值。所有页面只引用 `--nap-*` 与 `--el-*`,保证切换无遗漏。

---

## 3. 6 套主题取值表

| Token | professional | midnight | compact | sunset | cyber | purple |
| --- | --- | --- | --- | --- | --- | --- |
| primary | `#2563eb` | `#60a5fa` | `#475569` | `#f97316` | `#22d3ee` | `#a855f7` |
| primary-hover | `#1d4ed8` | `#3b82f6` | `#334155` | `#ea580c` | `#06b6d4` | `#9333ea` |
| success | `#16a34a` | `#22c55e` | `#15803d` | `#65a30d` | `#10b981` | `#16a34a` |
| warning | `#ea580c` | `#f59e0b` | `#d97706` | `#facc15` | `#facc15` | `#f59e0b` |
| danger | `#dc2626` | `#f87171` | `#b91c1c` | `#dc2626` | `#fb7185` | `#e11d48` |
| info | `#0891b2` | `#38bdf8` | `#0e7490` | `#06b6d4` | `#22d3ee` | `#8b5cf6` |
| bg-app | `#f5f7fb` | `#0b1220` | `#f1f5f9` | `#fff7ed` | `#020617` | `#faf5ff` |
| bg-elev-1 | `rgba(255,255,255,.78)` | `rgba(15,23,42,.6)` | `rgba(255,255,255,.92)` | `rgba(255,247,237,.85)` | `rgba(2,6,23,.65)` | `rgba(255,255,255,.78)` |
| bg-sidebar | `rgba(255,255,255,.85)` | `rgba(2,6,23,.7)` | `#ffffff` | `rgba(255,247,237,.92)` | `rgba(2,6,23,.78)` | `rgba(255,255,255,.85)` |
| text-primary | `#0f172a` | `#e2e8f0` | `#0f172a` | `#7c2d12` | `#e2e8f0` | `#3b0764` |
| text-regular | `#334155` | `#cbd5e1` | `#1e293b` | `#9a3412` | `#94a3b8` | `#581c87` |
| text-secondary | `#64748b` | `#94a3b8` | `#475569` | `#c2410c` | `#64748b` | `#7e22ce` |
| border | `rgba(15,23,42,.08)` | `rgba(148,163,184,.12)` | `rgba(15,23,42,.06)` | `rgba(124,45,18,.12)` | `rgba(34,211,238,.18)` | `rgba(168,85,247,.18)` |
| glass-blur | 18px | 22px | 8px(更扁平,更紧凑) | 16px | 24px | 18px |
| glass-shadow | `0 8px 24px rgba(15,23,42,.08)` | `0 8px 28px rgba(0,0,0,.45)` | `0 2px 6px rgba(15,23,42,.06)` | `0 8px 24px rgba(234,88,12,.18)` | `0 0 24px rgba(34,211,238,.18)` | `0 8px 24px rgba(168,85,247,.18)` |
| radius-md | 10px | 12px | 6px | 12px | 14px | 12px |
| gradient-aurora | 蓝青 | 深紫黑 | 单色背景(无 aurora) | 橙红 | 青紫霓虹 | 紫粉 |

> compact 主题特意压缩玻璃模糊与圆角,强调"紧凑、密集、专业",适合数据密度高的运营场景。

完整的 6 套 SCSS 实现见任务卡 `T-A02`。

---

## S10 任务卡

### T-A00 主题切换基础设施

- **类型**: feat
- **涉及文件**:
  - `apps/fronted/src/styles/themes/_tokens.scss`(变量定义,默认 = professional)
  - `apps/fronted/src/styles/themes/professional.scss`
  - `apps/fronted/src/styles/themes/midnight.scss`
  - 其余 4 套各一文件
  - `apps/fronted/src/styles/themes/index.scss`(import 6 套)
  - `apps/fronted/src/styles/global.scss`(应用层基础样式)
  - `apps/fronted/src/main.ts`(import index.scss)
  - `apps/fronted/index.html`(挂前同步脚本,见下)
- **实施要点**:
  1. 在 `apps/fronted/index.html` 的 `<head>` 末尾加内联脚本(必须在 Vue 挂载前):
     ```html
     <script>
       (function () {
         try {
           var t = localStorage.getItem('nap_theme') || 'professional';
           document.documentElement.setAttribute('data-theme', t);
         } catch (e) {}
       })();
     </script>
     ```
  2. `app store` 维护 `theme` 字段:
     ```ts
     export const useAppStore = defineStore('app', () => {
       const theme = useStorage<ThemeName>('nap_theme', 'professional');
       function setTheme(t: ThemeName) {
         theme.value = t;
         document.documentElement.setAttribute('data-theme', t);
       }
       return { theme, setTheme };
     });
     ```
  3. types:`type ThemeName = 'professional' | 'midnight' | 'compact' | 'sunset' | 'cyber' | 'purple';`
  4. 删除已废弃的 `utils/appearance.ts`(原 light/dark 类型)
- **验收**:
  - [ ] 刷新页面无主题闪烁(FOUC 0 秒级别)
  - [ ] localStorage 切主题后刷新保留
  - [ ] 直接 `document.documentElement.setAttribute('data-theme','xxx')` 在 Console 中切换可见效果

### T-A01 默认页面对接 CSS 变量

- **类型**: refactor
- **涉及文件**: `apps/fronted/src/views/**/*.vue`、`layout/**/*.vue`、`components/**/*.vue`
- **要点**:
  - 全局 grep 硬编码颜色十六进制(`#xxxxxx`、`rgba(...)`),逐一替换为 `var(--nap-*)`
  - 阴影、圆角、间距、字号 也同步走变量
  - Tailwind class 留用,但 Tailwind config extend 颜色为 `theme: { extend: { colors: { primary: 'var(--nap-primary)' } } }`,使 `bg-primary text-primary` 跟随主题
- **验收**: 6 套主题切换后,所有页面无残留固定色

### T-A02 6 套主题文件实现

- **类型**: feat
- **要点**:
  - 每套一个 `.scss` 文件,内容形如:
    ```scss
    :root[data-theme="midnight"] {
      --nap-primary: #60a5fa;
      --nap-primary-hover: #3b82f6;
      --nap-bg-app: #0b1220;
      --nap-bg-elev-1: rgba(15,23,42,0.6);
      --nap-bg-sidebar: rgba(2,6,23,0.7);
      --nap-text-primary: #e2e8f0;
      --nap-text-regular: #cbd5e1;
      --nap-border: rgba(148,163,184,0.12);
      --nap-glass-shadow: 0 8px 28px rgba(0,0,0,0.45);
      --nap-gradient-aurora:
        radial-gradient(120% 60% at 0% 0%, rgba(96,165,250,0.18) 0%, transparent 60%),
        radial-gradient(120% 60% at 100% 100%, rgba(168,85,247,0.18) 0%, transparent 60%),
        linear-gradient(135deg, #0b1220 0%, #1e1b4b 100%);
      /* ...(覆盖所有 token) */
    }
    ```
  - 6 个文件按 `§ 3 取值表` 完整生成
- **验收**:
  - [ ] 切换 6 套主题视觉差异明显
  - [ ] 暗色主题(midnight / cyber)文字与背景对比 ≥ WCAG AA(白底黑字 4.5)

### T-A03 主题切换 UI(Settings 抽屉)

- **类型**: feat
- **涉及文件**: `apps/fronted/src/layout/components/Settings/index.vue`、`Navbar/ThemeSelect.vue`
- **要点**:
  - Navbar 右侧添加调色板图标按钮,点击打开 Settings 抽屉
  - 抽屉内 6 个主题卡片:每张含
    - 主题名(i18n)
    - 配色预览条(展示 primary / success / warning / danger / 文本主色)
    - 当前主题打钩
  - 点击立即生效 + 持久化
  - 抽屉底部:"重置默认"按钮
- **验收**:
  - [ ] 抽屉 UI 美观,在 6 套主题下自身样式协调
  - [ ] 点击切换平滑(<100ms),无抖动

### T-A04 登录页 / 仪表盘的特殊主题元素

- **类型**: feat
- **要点**:
  - 登录页背景使用 `--nap-gradient-aurora`,卡片用玻璃态 `--nap-bg-elev-1` + `backdrop-filter: blur(var(--nap-glass-blur))`
  - 仪表盘的统计卡同样应用玻璃态
  - ECharts 配色读取 CSS 变量(用 `getComputedStyle` 读取后传入 ECharts option),主题切换后 chart resize / setOption 重渲染
- **验收**:
  - [ ] 登录页在 6 套主题下都有独特氛围(尤其 sunset / cyber 视觉冲击力)
  - [ ] 仪表盘 ECharts 颜色跟随主题

### T-A05 主题与 Element Plus dark 模式联动

- **类型**: feat
- **要点**:
  - midnight / cyber 主题:在 `<html>` 同时加 `class="dark"`,启用 Element Plus 的 dark 模式样式(`@import 'element-plus/theme-chalk/dark/css-vars.css'`)
  - 其他主题:移除 `dark` class
  - 通过 app.setTheme 中扩展逻辑统一处理
- **验收**: dark 主题下 EP 组件(Select / DatePicker 弹层)颜色正确,无白底

### T-A06 移动端浅/深主题(联动 05 文档 T-806)

- **类型**: feat
- **涉及文件**: `apps/app/src/styles/themes.scss`、`apps/app/src/stores/app.ts`
- **要点**:
  - 仅 light / dark / auto 三档(auto 跟随系统 `uni.getSystemInfoSync().theme`)
  - 用 CSS 变量定义,page 根节点 `:root` 与 `.theme-dark` 类切换
  - 与 Web 端不同套主题,不强求 6 套
- **验收**: H5 端切换主题与系统深浅模式联动

### T-A07 主题质量回归

- **类型**: test
- **要点**:
  - 跑遍登录 / 仪表盘 / 用户管理 / 角色 / 部门 / 菜单 / 字典 / 通知 / 监控 / 代码生成 共 12 个核心页面 × 6 套主题 = 72 个截图
  - 检查:文字对比度、按钮色一致、表格斑马纹清晰、表单边框可见、弹层背景非透
  - 修复发现的视觉残留(硬编码色)
- **验收**: 12 × 6 截图清单存档(可放 `docs/spec/screenshots/themes/`,选择性存),关键页面无明显问题

---

## 全部主题任务卡总数

| 卡 | 内容 |
| --- | --- |
| T-A00 | 切换基础设施 |
| T-A01 | 现有页面替换硬编码色 |
| T-A02 | 6 套主题实现 |
| T-A03 | 主题切换 UI |
| T-A04 | 登录页 / 仪表盘特殊元素 |
| T-A05 | EP dark 模式联动 |
| T-A06 | 移动端 light/dark/auto |
| T-A07 | 视觉回归 |

合计 8 张。

---

## S10 完成门禁

- [ ] 6 套主题切换无残留固定色
- [ ] 刷新无 FOUC
- [ ] EP dark 模式正确联动
- [ ] WCAG AA 文字对比度达标(尤其 midnight / cyber)
- [ ] ECharts 颜色跟随主题
- [ ] 移动端 light/dark/auto 工作

S10 完成 = 整个项目交付完成。Codex 在 `PROGRESS.md` 把所有 11 个 stage 都打钩 + 在 README 添加 Demo 截图(可选)+ 提交最终 release tag `v1.0.0`(由用户决定)。

---

完。8 份 spec 文档全部完成。
