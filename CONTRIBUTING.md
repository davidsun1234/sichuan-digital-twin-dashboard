# Contributing

这个仓库提供一个轻量、清晰、易二次开发的数据孪生大屏模板。

## 本地开发

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:4173/
```

无需安装依赖时，可使用任意静态文件服务器打开项目根目录。

## 提交前检查

```bash
npm run check
```

检查项包括：

- 必要文件是否存在。
- HTML 是否引用核心样式与脚本。
- GeoJSON 是否能被解析。
- 源码中是否残留明显的旧项目标识。

## 贡献方向

- 地图交互优化：标签避让、点击下钻、图层切换。
- 数据建模：将模拟数据替换为 API / WebSocket / SSE。
- 可视化组件：新增水文、交通、能源、应急等行业指标。
- 工程化：拆分模块、增加测试、增加构建流程。
- 国际化：完善英文界面文案和多语言切换。

## Pull Request 规范

- 保持改动聚焦，一次 PR 解决一个明确问题。
- 附上修改前后截图，尤其是 UI 和地图交互变更。
- 新增数据字段时说明来源、结构和隐私风险。
- 不提交真实敏感数据、密钥、访问令牌或内部地址。

## Commit 风格

提交信息采用简洁的语义化格式：

```text
feat: add city layer switcher
fix: correct canvas hit testing on high dpi screens
docs: update english deployment guide
```
