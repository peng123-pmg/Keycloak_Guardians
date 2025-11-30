# Keycloak Guardians - 使用指南

这是一个基于 Keycloak 的团队协作管理系统前端项目,支持团队创建、文件管理、任务进度跟踪等功能。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v7
- **认证**: Keycloakify 10.0
- **HTTP客户端**: Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

项目已配置好开发环境,直接使用即可。默认使用 **Mock 模式**(模拟数据),无需启动后端服务。


### 3. 启动开发服务器

项目提供了两种开发模式:

#### 方式一: 完整模式 (含Keycloak登录页)
```bash
npm run dev
```
访问: http://localhost:5173

包含 Keycloak 登录页面和主应用界面,模拟完整的用户登录流程。

#### 方式二: 应用预览模式 (仅主界面)
```bash
npm run dev:app
```
访问: http://localhost:5173

直接预览主应用Dashboard界面,跳过登录页面,适合快速开发UI。

### 4. 构建项目

#### 构建主应用
```bash
npm run build
```

#### 构建应用预览版本
```bash
npm run build:app
```

#### 构建 Keycloak 主题包
```bash
npm run build-keycloak-theme
```

生成的主题包可以直接部署到 Keycloak 服务器。

## 项目结构

```
src/
├── pages/              # 页面组件
│   ├── Dashboard/      # 仪表盘主页
│   ├── MyTeams/        # 我的团队
│   ├── CreatedTeams/   # 我创建的团队
│   ├── CreateTeam/     # 创建团队
│   ├── PersonalFiles/  # 个人文件
│   ├── RecycleBin/     # 回收站
│   ├── TaskProgress/   # 任务进度
│   └── ...
├── components/         # 通用组件
│   ├── Button/
│   ├── Input/
│   ├── FileUpload/
│   └── ...
├── services/           # 服务层
│   └── fileService.ts  # 文件服务(Mock数据)
├── login/              # Keycloak登录主题
│   ├── pages/          # 登录页面
│   └── components/     # 登录组件
├── styles/             # 全局样式
│   ├── variables.css   # CSS变量
│   └── global.css      # 全局样式
└── main.tsx            # 应用入口
```

## 页面开发说明

### 认证和数据模式

项目默认使用 **Mock 模式**,所有数据都是模拟的:
- 测试账号: `admin/admin123`
- 无需启动后端服务
- 适合专注于前端页面开发

### 主要功能页面

1. **团队管理**: 创建团队、加入团队、管理团队成员
2. **文件管理**: 上传、下载、预览、删除文件
3. **任务进度**: 跟踪团队任务进度
4. **消息通知**: 接收系统消息和团队通知
5. **个人中心**: 管理个人信息和设置

## 常见问题

### 1. 启动后看不到登录页面?

检查 `.env` 文件中的 `VITE_USE_MOCK_AUTH` 配置:
- 如果为 `true`,会显示模拟登录页
- 如果为 `false`,需要配置正确的 Keycloak 服务器地址

### 2. 如何添加新页面?

1. 在 `src/pages/` 下创建新页面文件夹和组件
2. 在 `Dashboard.tsx` 中添加路由配置
3. 在侧边栏菜单中添加导航项

### 3. 如何修改样式?

- **全局样式**: 修改 `src/styles/global.css`
- **CSS变量**: 修改 `src/styles/variables.css` (颜色、字体等)
- **组件样式**: 每个组件有自己的 CSS 文件

### 4. 文件相关功能

`src/services/fileService.ts` 提供了文件上传、下载等基础功能的 Mock 实现:
- 上传文件 (模拟进度)
- 下载文件
- 删除文件
- 文件列表管理

在 `MyTeamsPage` 中有使用示例。其他 API 对接功能由后端同学负责。

### 5. 如何调试登录页面?

使用完整模式启动:
```bash
npm run dev
```
修改 `src/login/` 下的组件,热更新会立即生效。

## 预览和部署

### 本地预览构建结果

```bash
npm run preview       # 预览主应用
npm run preview:app   # 预览应用模式
```

### 部署到生产环境

1. 修改 `.env.production` 配置生产环境参数
2. 构建生产版本: `npm run build`
3. 将 `dist/` 目录部署到静态服务器
4. 将 Keycloak 主题包部署到 Keycloak 服务器

## 页面开发流程

### 典型开发步骤

1. **启动项目**: `npm run dev:app` (预览模式,快速看到UI效果)
2. **创建页面**: 在 `src/pages/` 下新建页面组件
3. **编写样式**: 使用 CSS 变量保持风格统一
4. **复用组件**: 优先使用 `src/components/` 中的通用组件
5. **测试交互**: 在浏览器中测试各种用户操作

### 开发建议

- 优先使用 `npm run dev:app` 模式,直接看到页面效果
- 参考现有页面的代码结构和样式风格
- 使用 `src/components/` 中的通用组件,保持界面一致性
- 修改代码后会自动热更新,立即看到效果
- 提交代码前确保没有 TypeScript 错误

## 注意事项

- Node.js 版本建议 >= 16
- 首次运行需要 `npm install` 安装依赖
- 开发时建议使用 Chrome 浏览器的开发者工具
- Mock 模式下的数据不会持久化
