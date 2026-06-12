# 🏆 2026世界杯智能预测

基于 **Elo评分 + 泊松回归 + 蒙特卡洛模拟** 的2026年美加墨世界杯智能预测引擎。

## ✨ 功能特性

- 📅 **完整赛程** — 104场比赛（72场小组赛 + 32场淘汰赛）
- 📊 **智能预测** — 每场比赛胜/平/负概率 + 预期进球 + 进球分布
- 🏅 **冠军预测** — 基于Elo评分的夺冠概率排名
- ⚽ **金靴预测** — 核心球员预期进球数排名
- ⚡ **爆冷预警** — 实时检测潜在冷门比赛
- 🔬 **阵容分析** — 48支球队的伤病/停赛/体能影响评估
- 📈 **预测准确性追踪** — Brier评分 + 校准评级 + 进球误差对比
- 📱 **PWA移动端适配** — 响应式设计 + 安全区域适配

## 🧠 预测模型

| 模型组件 | 说明 |
|---------|------|
| **Elo评分** | 基于eloratings.net最新数据 |
| **泊松回归** | 计算预期进球与比分概率 |
| **蒙特卡洛模拟** | 50,000次迭代，种子随机确保可复现 |
| **多维度调整** | FIFA排名、世界杯历史、阵容价值、高原/湿热/时差、伤病/停赛 |
| **阵容影响** | 贪心算法预测最佳首发11人 + 各线实力评估 |

## 🚀 技术栈

- **前端框架**: React 18 + TypeScript (strict mode)
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 3 + 玻璃拟态设计
- **路由**: React Router 7 (HashRouter)
- **状态管理**: Zustand
- **图表**: Recharts
- **测试**: Vitest + Testing Library
- **CI/CD**: GitHub Actions → GitHub Pages

## 📦 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 类型检查
npm run check

# 运行测试
npm run test

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

## 🧪 测试覆盖

```
✓ 53 tests passed (3 test files)
  - format.test.ts       (13 tests)  格式化/工具函数
  - data-integrity.test.ts (22 tests) 数据一致性/外键验证
  - predictions.test.ts   (18 tests)  核心预测算法
```

## 📂 项目结构

```
src/
├── components/          # 可复用UI组件
│   ├── BottomNav.tsx    # 底部导航栏
│   ├── CountdownTimer.tsx # 倒计时组件
│   ├── ErrorBoundary.tsx  # 错误边界
│   ├── MatchCard.tsx    # 比赛卡片
│   ├── ProbabilityBar.tsx # 概率条
│   └── TeamBadge.tsx    # 球队标识(国旗+名称)
├── data/                # 数据层
│   ├── matches.ts       # 104场比赛数据
│   ├── teams.ts         # 48支球队数据
│   ├── players.ts       # 球队阵容/伤病数据
│   ├── venues.ts        # 16个场馆数据
│   ├── predictions.ts   # 核心预测算法 (900+行)
│   └── results.ts       # 比赛结果 + 预测对比
├── hooks/               # 自定义Hooks
├── pages/               # 路由页面 (6个 + 404)
├── store/               # Zustand状态管理
├── utils/               # 工具函数
│   ├── flags.ts         # 国旗映射 (flagcdn.com)
│   ├── format.ts        # 格式化工具
│   └── lineup.ts        # 阵容分析算法 (900+行)
└── test/                # 测试配置
```

## 🌐 部署

推送到 `main` 分支后，GitHub Actions 自动执行：
1. `npm ci` — 安装依赖
2. `npm run lint` — 代码检查
3. `npm run check` — TypeScript类型检查
4. `npm run test` — 运行测试
5. `npm run build` — 生产构建
6. 部署到 GitHub Pages

## 📄 数据来源

- FIFA官方排名
- eloratings.net
- Sportsnet、Vietnam.vn、worldcdb.com 等权威媒体
- Transfermarkt球员身价数据

## 📝 许可证

MIT License
