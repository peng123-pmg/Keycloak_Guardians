# Keycloak Guardians - UI开发使用指南

这是一个基于 Keycloak 的团队协作管理系统前端项目,负责所有用户界面的开发。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v7
- **认证主题**: Keycloakify 10.0

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

项目会自动打开,包含登录页面和主应用界面。

### 3. 构建项目

```bash
npm run build
```

构建完成后,产物在 `dist/` 目录。

### 4. 构建 Keycloak 主题包

```bash
npm run build-keycloak-theme
```

生成的 `.jar` 主题包在 `dist_keycloak/` 目录,可部署到 Keycloak 服务器。

## 项目结构

```
src/
├── pages/              # 页面组件
│   ├── Dashboard/      # 主仪表盘(包含所有子页面路由)
│   ├── MyTeams/        # 我的团队
│   ├── CreatedTeams/   # 我创建的团队
│   ├── CreateTeam/     # 创建团队
│   ├── PersonalFiles/  # 个人文件
│   ├── RecycleBin/     # 回收站
│   ├── TaskProgress/   # 任务进度
│   ├── NotificationCenter/  # 通知中心
│   └── MessageDetail/  # 消息详情
├── components/         # 通用组件
│   ├── Button/         # 按钮组件
│   ├── Input/          # 输入框组件
│   ├── Checkbox/       # 复选框组件
│   ├── FileUpload/     # 文件上传组件
│   ├── GlobalSearch/   # 全局搜索
│   └── BackButton/     # 返回按钮
├── login/              # Keycloak登录主题
│   ├── pages/          # 登录页面(Login.tsx)
│   └── components/     # 登录相关组件
├── services/           # 服务层
│   └── fileService.ts  # 文件服务(Mock数据)
├── styles/             # 全局样式
│   ├── variables.css   # CSS变量(颜色、字体等)
│   └── global.css      # 全局样式
└── main.tsx            # 应用入口
```

## 开发说明

### 页面导航结构

项目采用单页应用(SPA)架构:
- **登录页**: `/` - 使用 Keycloak 登录主题
- **主应用**: 登录后进入 Dashboard,包含侧边栏导航
  - 我的团队
  - 我创建的
  - 个人文件
  - 回收站
  - 任务进度
  - 通知中心

### 样式开发

**CSS变量** (`src/styles/variables.css`):
```css
--primary-color: #4A90E2;      /* 主色调 */
--secondary-color: #7ED321;    /* 辅助色 */
--bg-color: #F5F7FA;          /* 背景色 */
/* ... 更多变量 */
```

**组件样式**: 每个组件使用 CSS Modules (`.module.css`),样式自动隔离。

### 通用组件使用

项目提供了一套通用组件,使用前请查看对应文件:

```tsx
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FileUpload } from '@/components/FileUpload';

// 使用示例
<Button variant="primary" onClick={handleClick}>
  提交
</Button>
```

### 文件上传功能

`MyTeamsPage` 中有完整的文件上传示例:
```tsx
import { FileUpload } from '@/components/FileUpload';
import { fileService } from '@/services/fileService';

// 在组件中使用
<FileUpload
  onFilesSelected={handleFilesSelected}
  maxFileSize={50 * 1024 * 1024}  // 50MB
  multiple={true}
/>
```

## 环境配置

项目根目录的 `.env` 文件包含环境配置,通常无需修改:
```env
VITE_USE_MOCK_AUTH=true        # Mock 认证模式
VITE_BACKEND_URL=http://localhost:8081
```

如需对接真实后端,由后端同学提供配置参数。
