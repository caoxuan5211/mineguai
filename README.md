# Mineguai 麻将记账器

Mineguai 是四人麻将熟人局的本地记账网页。它优先服务手机桌边使用：先点对手，再点输赢金额，两步完成一笔记录。

## 功能

- 四位玩家，可直接改名，第一位默认是“我”
- 支持自定义记账步长和快捷金额
- 支持撤销上一笔、撤销指定记录、结束本局和开新局
- 自动统计当前领先者、当前分差和封存局数
- 数据保存在当前浏览器 `localStorage`，不需要账号或服务端
- 通过 GitHub Pages 发布到 `mineguai.com`

## 本地开发

```powershell
npm install
npm run dev
```

## 构建

```powershell
npm run build
```

构建产物输出到 `dist/`。推送到 `main` 后，`.github/workflows/deploy-pages.yml` 会自动构建并部署到 GitHub Pages。
