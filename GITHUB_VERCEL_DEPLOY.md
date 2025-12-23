# 通过 GitHub + Vercel 部署步骤

## ✅ 已完成
- ✅ Git 仓库已初始化
- ✅ 代码已提交到本地仓库
- ✅ Vercel 配置文件已创建

## 📋 接下来的步骤

### 步骤 1: 在 GitHub 上创建新仓库

1. 访问 https://github.com
2. 登录你的 GitHub 账号
3. 点击右上角的 **"+"** → **"New repository"**
4. 填写仓库信息：
   - **Repository name**: `leadsite-ai` (或你喜欢的名称)
   - **Description**: LeadSite AI - AI-powered website builder
   - **Visibility**: 选择 Public 或 Private
   - **⚠️ 重要**: **不要**勾选 "Initialize this repository with a README"
5. 点击 **"Create repository"**

### 步骤 2: 连接本地仓库到 GitHub

在项目目录下运行以下命令（将 `YOUR_USERNAME` 替换为你的 GitHub 用户名）：

```bash
cd "C:\Users\Admin\Desktop\LeadSite AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/leadsite-ai.git
git push -u origin main
```

**或者使用 SSH**（如果你配置了 SSH key）：
```bash
git remote add origin git@github.com:YOUR_USERNAME/leadsite-ai.git
git push -u origin main
```

### 步骤 3: 在 Vercel 上部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 **"Sign Up"** 或 **"Log In"**
   - 使用 **GitHub 账号登录**（推荐）

2. **导入项目**
   - 登录后，点击 **"Add New Project"**
   - 在 "Import Git Repository" 中，选择你刚创建的 `leadsite-ai` 仓库
   - 点击 **"Import"**

3. **配置项目设置**
   - **Framework Preset**: Next.js（会自动检测）
   - **Root Directory**: 点击 "Edit" → 选择或输入 `my-app`
   - **Build Command**: `npm run build`（默认，无需修改）
   - **Output Directory**: `.next`（默认，无需修改）
   - **Install Command**: `npm install`（默认，无需修改）

4. **环境变量（可选）**
   - 如果项目需要环境变量（如 OpenAI API Key），点击 "Environment Variables"
   - 添加变量：
     - `OPENAI_API_KEY` = `你的API密钥`（如果需要）

5. **部署**
   - 点击 **"Deploy"** 按钮
   - 等待构建完成（通常 2-5 分钟）
   - 部署成功后，你会看到：
     - ✅ 部署成功消息
     - 🌐 你的网站 URL：`https://your-project.vercel.app`

### 步骤 4: 访问你的网站

部署完成后，你可以：
- 访问自动生成的域名：`https://your-project.vercel.app`
- 在 Vercel 项目设置中配置自定义域名
- 每次推送到 GitHub 的 `main` 分支，Vercel 会自动重新部署

## 🎉 完成！

你的 LeadSite AI 项目现在已经部署到 Vercel 了！

## 📝 后续更新

以后更新代码时，只需要：

```bash
git add .
git commit -m "更新描述"
git push
```

Vercel 会自动检测到更改并重新部署。

## ❓ 遇到问题？

- **构建失败**: 查看 Vercel 的构建日志，检查错误信息
- **找不到文件**: 确认 Root Directory 设置为 `my-app`
- **环境变量**: 确保在 Vercel 项目设置中正确配置了环境变量

