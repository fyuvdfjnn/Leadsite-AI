# 快速部署到 Vercel

## 最简单的方式：通过 Vercel 网站部署

### 步骤：

1. **访问 Vercel 网站**
   - 打开 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录（推荐 GitHub）

2. **导入项目**
   - 点击 "Add New Project"
   - 如果代码在 GitHub，选择你的仓库
   - 如果代码在本地，先推送到 GitHub：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin <你的GitHub仓库地址>
     git push -u origin main
     ```

3. **配置项目设置**
   - **Framework Preset**: Next.js（会自动检测）
   - **Root Directory**: 选择 `my-app` 或手动输入 `my-app`
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）

4. **环境变量（可选）**
   - 如果需要 OpenAI API Key 等，在 "Environment Variables" 中添加

5. **点击 Deploy**
   - 等待构建完成（通常 2-5 分钟）
   - 部署成功后获得 `https://your-project.vercel.app` 域名

## 使用 CLI 部署（需要先登录）

如果你想使用命令行：

```bash
# 1. 登录（会打开浏览器）
vercel login

# 2. 在项目根目录部署
vercel

# 3. 生产环境部署
vercel --prod
```

## 项目已配置

✅ `vercel.json` 已创建，指定根目录为 `my-app`
✅ Next.js 配置已就绪
✅ 构建脚本已配置

## 注意事项

- 确保 `my-app` 目录下有 `package.json`
- 首次部署会自动安装依赖
- 如果构建失败，检查 Vercel 构建日志

