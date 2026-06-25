# 川域智联运行孪生平台

> 一个零运行时依赖、可直接部署的数据孪生大屏模板，面向四川省级智慧城市、能源调度、交通运行、水文预警和应急指挥等可视化场景。

[English](./README.en.md) · [贡献指南](./CONTRIBUTING.md) · [安全策略](./SECURITY.md)

## 项目概览

川域智联运行孪生平台是一个轻量级 Canvas 数据可视化项目。它以四川省地级行政区 GeoJSON 为基础，提供动态地图、地市标签、线路脉冲、事件编排、能源供给、区域负载和跨域联动时间轴等模块。

项目当前采用原生 HTML / CSS / JavaScript 编写，不依赖 React、Vue、ECharts 或 Three.js。项目适用于以下场景：

- 智慧城市运行驾驶舱
- 省域能源调度大屏
- 交通与应急指挥中心
- 水文、气象、园区、文旅等专题态势屏
- 课程设计、竞赛作品、开源可视化 Demo

## 在线预览

启用 GitHub Pages 后，页面部署地址为：

```text
https://davidsun1234.github.io/sichuan-digital-twin-dashboard/
```

本地预览：

```bash
npm install
npm run dev
```

然后访问：

```text
http://127.0.0.1:4173/
```

仓库也可直接用任意静态文件服务器打开。

## 界面预览

![川域智联运行孪生平台预览](./docs/preview.png)

## 核心特性

- **四川省地市级地图渲染**  
  基于 `assets/sichuan.geojson` 绘制四川省 21 个地级行政区，支持完整地名标签、行政区悬停高亮和提示信息。

- **高 DPI 友好的 Canvas 命中检测**  
  地图命中路径独立缓存，鼠标坐标使用未缩放坐标体系，避免高分屏、浏览器缩放和 CSS 缩放造成的悬停偏移。

- **动态能源供给模块**  
  清洁能源占比、风光出力、储能响应时间会持续模拟变化，仪表盘同步刷新。

- **动态区域负载 TOP5**  
  地市负载按周期波动并重新排序，使用不同颜色表示常态、预警和高负载状态。

- **事件编排轮播**  
  事件列表按时间自动滚动，包含地市、事件描述、状态和闭环率。

- **跨域联动时间轴**  
  时间轴自动推进，当前执行项高亮展示，适合表现跨部门协同流程。

- **零运行时依赖**  
  核心页面只依赖浏览器原生能力，适合 GitHub Pages、对象存储、Nginx、内网静态服务器等部署方式。

- **开源项目配套文件完整**  
  已包含 README、英文 README、MIT License、贡献指南、行为准则、Issue 模板、PR 模板、安全策略和 GitHub Pages 工作流。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 页面结构 | HTML5 |
| 样式 | CSS3、响应式 Grid、Canvas 叠加层 |
| 地图绘制 | Canvas 2D + GeoJSON |
| 动态数据 | 原生 JavaScript 定时调度 |
| 部署 | GitHub Pages / 任意静态服务器 |
| 依赖策略 | 页面运行时零依赖 |

## 目录结构

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── pages.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/
│   └── sichuan.geojson
├── docs/
│   └── preview.png
├── scripts/
│   └── check-project.mjs
├── app.js
├── index.html
├── styles.css
├── package.json
├── README.md
├── README.en.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/davidsun1234/sichuan-digital-twin-dashboard.git
cd sichuan-digital-twin-dashboard
```

### 2. 安装开发依赖

```bash
npm install
```

### 3. 启动本地预览

```bash
npm run dev
```

### 4. 项目检查

```bash
npm run check
```

检查内容包括必要文件、GeoJSON 可解析性、HTML 引用关系和旧项目标识残留。

## 数据说明

项目当前使用模拟运行数据，适合展示和二次开发：

- `cities`：重点地市点位、基础负载、动态状态。
- `eventPool`：事件编排池，包含地市、事件文案、状态和等级。
- `timelinePool`：跨域联动时间轴任务池。
- `assets/sichuan.geojson`：四川地级行政区边界数据。

接入真实数据时，核心替换入口如下：

- `updateLoadData()`：区域负载。
- `updateEventList()`：事件编排。
- `updateTimeline()`：联动时间轴。
- `updateEnergyData()`：能源供给。

模拟数据可替换为以下来源：

- REST API
- WebSocket
- Server-Sent Events
- 本地 JSON 文件
- 边缘网关上报数据

## 地图交互设计

地图渲染分为四层：

1. 背景雷达环与网格氛围层。
2. 四川地级行政区块面。
3. 全量地市名称标签。
4. 线路脉冲、重点点位和事件热度。

鼠标悬停时会进行行政区命中检测，并更新：

- 行政区高亮。
- 悬浮提示框。
- 当前聚焦区域。

## 部署

### GitHub Pages

仓库已经包含 `.github/workflows/pages.yml`。推送到 `main` 分支后，在 GitHub 仓库设置中启用 Pages：

1. 打开仓库 `Settings`。
2. 进入 `Pages`。
3. Source 选择 `GitHub Actions`。
4. 推送 `main` 分支后自动部署。

### Nginx

```nginx
server {
  listen 80;
  server_name dashboard.example.com;
  root /var/www/sichuan-digital-twin-dashboard;
  index index.html;
}
```

### 对象存储 / CDN

把项目根目录下的静态文件上传即可。需要确保：

- `index.html` 在站点根目录。
- `assets/sichuan.geojson` 可被浏览器访问。
- 项目不捆绑第三方字体，默认使用系统中文字体栈。

## 浏览器支持

- Chrome 100+
- Edge 100+
- Firefox 100+
- Safari 15+

核心依赖 Canvas 2D、CSS Grid、Fetch API 和 ES Module 级别的现代 JavaScript。

## 许可证

本项目基于 [MIT License](./LICENSE) 开源。

请注意：地图数据和任何第三方素材可能具有各自的授权要求。当前项目不再捆绑未知授权字体，默认使用系统字体。公开发布时需确认 GeoJSON 数据来源允许开源分发。
