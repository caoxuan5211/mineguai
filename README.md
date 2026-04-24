# Mineguai 麻将记账器

四人麻将本地记账网页，适合熟人局快速记账。页面是零依赖静态站点，GitHub Pages 可直接用 Actions 部署。

## 功能

- 四位玩家，可直接改名，第一位默认是“我”
- 支持自摸、点炮、普通转账
- 支持记账步长、备注、撤销上一笔、删除指定记录
- 自动统计总局数、最大单手、四人零和校验
- 数据保存在当前浏览器 `localStorage`
- 支持 JSON 导入和导出备份

## 本地预览

直接双击 `index.html`，或在项目目录启动任意静态服务器。

```powershell
python -m http.server 5173
```

然后打开 `http://localhost:5173`。

## 提交并推送

运行：

```powershell
.\commit-and-push.ps1
```

脚本会初始化 git 仓库、设置远程地址、提交当前文件并推送到 `main` 分支。

## GitHub Pages

推送到 `main` 后，`.github/workflows/deploy-pages.yml` 会把当前静态站点部署到 GitHub Pages。
仓库首次使用时，需要在 GitHub 仓库设置里启用 Pages，并选择 GitHub Actions 作为 Source。
