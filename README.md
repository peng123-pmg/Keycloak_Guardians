# Keycloak Guardians

基于React + Keycloak的认证管理系统

## 项目简介

集成Keycloak认证的React前端应用，支持团队管理、文件管理、消息通知等功能。

**核心特性**：
- 完整的Keycloak认证集成
- 现代化的UI设计
- Mock/真实API无缝切换
- 完善的权限管理
- 响应式布局

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 访问应用
```
http://localhost:5173
```

### 登录测试
Mock模式（默认）：
- 用户名: `admin` / 密码: `123456`
- 用户名: `alice` / 密码: `alice`
- 用户名: `jdoe` / 密码: `jdoe`

## 项目结构

```
Keycloak_Guardians-main/
├── src/
│   ├── services/          # 服务层（API、认证）
│   ├── pages/             # 页面组件
│   ├── components/        # 通用组件
│   ├── utils/             # 工具函数
│   └── styles/            # 全局样式
├── .env                   # 环境配置
└── package.json           # 项目依赖
```

## 环境配置

### Mock模式（开发推荐）
```env
VITE_USE_MOCK_AUTH=true
```

### 真实API模式（联调使用）
```env
VITE_USE_MOCK_AUTH=false
VITE_BACKEND_URL=http://localhost:8081
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=guardians
VITE_KEYCLOAK_CLIENT_ID=backend-service
```

## 主要功能

- 用户登录/登出
- 用户信息管理
- 团队管理
- 消息通知中心
- 任务进度跟踪
- 文件管理
- 回收站功能

## 技术栈

- React 18.2.0
- TypeScript 5.3.0
- Vite 5.0.0
- React Router 7.9.6
- Axios 1.6.0
- Keycloakify 10.0.0

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run build-keycloak-theme` - 构建Keycloak主题

## API集成

### 后端API端点

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/users/me` | GET | 登录用户 | 获取当前用户信息 |
| `/api/user/stats` | GET | admin | 获取用户统计数据 |
| `/api/admin/users` | POST | admin | 创建新用户 |

### 使用示例

```typescript
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

// 登录
const result = await authService.login({
  username: 'admin',
  password: '123456'
});

// 获取用户信息
const user = await authService.getCurrentUser();

// 获取统计数据
const stats = await userService.getUserStats();
```

## 常见问题

### 如何切换Mock/真实API模式？
修改 `.env` 文件中的 `VITE_USE_MOCK_AUTH` 配置：
```env
VITE_USE_MOCK_AUTH=true   # Mock模式
VITE_USE_MOCK_AUTH=false  # 真实API模式
```

### 提示"无法连接到认证服务器"？
确保后端服务已启动：
```bash
# 检查后端服务
curl http://localhost:8081/health

# 启动后端服务
cd keycloak-server
./gradlew quarkusDev
```

## 团队成员

- 李欣冉 - 前端开发
- 彭茂刚 - 前端开发

## 许可证

MIT License
