# 部署到 Vercel 指南

## 方式一：通过 Vercel CLI 部署（推荐）

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署项目

在项目根目录运行：

```bash
vercel
```

首次部署会提示：
- 是否链接到现有项目？选择 `N`（新建项目）
- 项目名称：输入项目名称（如 `leadsite-ai`）
- 项目目录：确认是 `my-app`
- 是否覆盖设置：选择 `Y`

### 4. 生产环境部署

```bash
vercel --prod
```

## 方式二：通过 Vercel 网站部署（GitHub 集成）

### 1. 将代码推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 在 Vercel 网站部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `my-app`
   - **Build Command**: `npm run build`（自动检测）
   - **Output Directory**: `.next`（自动检测）
6. 点击 "Deploy"

## 环境变量配置（如果需要）

如果项目需要环境变量（如 OpenAI API Key），在 Vercel 项目设置中添加：

1. 进入项目设置 → Environment Variables
2. 添加变量：
   - `OPENAI_API_KEY`（如果需要）
   - 其他需要的环境变量

## 注意事项

- 项目已配置 `vercel.json`，指定根目录为 `my-app`
- 确保 `my-app/package.json` 中有正确的构建脚本
- 首次部署可能需要几分钟时间
- 部署后会自动获得一个 `*.vercel.app` 域名

## 故障排除

如果部署失败：
1. 检查构建日志中的错误信息
2. 确保所有依赖都已正确安装
3. 检查 Node.js 版本兼容性（推荐 18.x 或更高）

