# Keycloak Guardians - 前端应用

> 基于React + Keycloak的认证管理系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

---

## 📖 项目简介

这是一个集成了Keycloak认证的React前端应用，支持团队管理、文件管理、消息通知等功能。

**核心特性**：
- 🔐 完整的Keycloak认证集成
- 🎨 现代化的UI设计
- 🔄 Mock/真实API无缝切换
- 🛡️ 完善的权限管理
- 📱 响应式布局

---

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
```
http://localhost:5173
```

### 4. 登录测试
**Mock模式**（默认）：
- 用户名: `admin` / 密码: `123456`
- 用户名: `alice` / 密码: `alice`
- 用户名: `jdoe` / 密码: `jdoe`

---

## 📂 项目结构

```
Keycloak_Guardians-main/
├── src/
│   ├── services/          # 服务层（API、认证）
│   ├── pages/             # 页面组件
│   ├── components/        # 通用组件
│   ├── utils/             # 工具函数
│   └── styles/            # 全局样式
├── .env                   # 环境配置
├── package.json           # 项目依赖
└── 文档/                  # 详细文档
```

---

## 🔧 环境配置

### Mock模式（开发推荐）
```env
# .env
VITE_USE_MOCK_AUTH=true
```
- ✅ 无需后端服务
- ✅ 快速开发调试
- ✅ 数据稳定可预测

### 真实API模式（联调使用）
```env
# .env
VITE_USE_MOCK_AUTH=false
VITE_BACKEND_URL=http://localhost:8081
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=guardians
VITE_KEYCLOAK_CLIENT_ID=backend-service
```
- ⚠️ 需要后端服务运行
- ⚠️ 需要Keycloak服务运行

---

## 📚 完整文档

| 文档 | 说明 |
|------|------|
| [快速开始.md](快速开始.md) | 5分钟快速上手指南 |
| [后端对接使用说明.md](后端对接使用说明.md) | API使用和测试说明 |
| [前端对接指南.md](前端对接指南.md) | 技术实现细节 |
| [系统架构说明.md](系统架构说明.md) | 架构设计文档 |
| [实施完成总结.md](实施完成总结.md) | 实施总结报告 |

---

## 🎯 主要功能

### 已实现功能
- ✅ 用户登录/登出
- ✅ 用户信息管理
- ✅ 团队管理
- ✅ 消息通知中心
- ✅ 任务进度跟踪
- ✅ 文件管理
- ✅ 回收站功能

### 认证功能
- ✅ Keycloak集成
- ✅ Token自动管理
- ✅ 权限角色检查
- ✅ Mock模式支持

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| TypeScript | 5.3.0 | 类型安全 |
| Vite | 5.0.0 | 构建工具 |
| React Router | 7.9.6 | 路由管理 |
| Axios | 1.6.0 | HTTP客户端 |
| Keycloakify | 10.0.0 | Keycloak集成 |

---

## 📦 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run build-keycloak-theme` | 构建Keycloak主题 |

---

## 🔑 API集成

### 已对接的后端API

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

---

## 🧪 测试

### 测试后端连接
```javascript
// 在浏览器控制台执行
import { testBackendConnection, printTestResults } from './src/utils/testBackend';
const results = await testBackendConnection();
printTestResults(results);
```

### 查看认证状态
```javascript
import { getAuthSummary } from './src/services/authUtils';
console.log(getAuthSummary());
```

---

## 🐛 常见问题

### Q: 如何切换Mock/真实API模式？
**A**: 修改 `.env` 文件中的 `VITE_USE_MOCK_AUTH` 配置：
```env
VITE_USE_MOCK_AUTH=true   # Mock模式
VITE_USE_MOCK_AUTH=false  # 真实API模式
```

### Q: 提示"无法连接到认证服务器"？
**A**: 确保后端服务已启动：
```bash
# 检查后端服务
curl http://localhost:8081/health

# 启动后端服务
cd keycloak-server
./gradlew quarkusDev
```

### Q: CORS跨域错误？
**A**: 后端已配置CORS，如仍有问题，检查后端配置文件：
```properties
quarkus.http.cors=true
quarkus.http.cors.origins=*
```

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👥 团队成员

- **李欣冉** - 前端开发
- **彭茂刚** - 后端开发

---

## 📞 获取帮助

1. 查阅[完整文档](#-完整文档)
2. 使用内置的测试工具诊断问题
3. 查看浏览器控制台日志
4. 联系团队成员

---

## 🎉 开始使用

```bash
# 1. 克隆仓库
git clone https://github.com/peng123-pmg/Keycloak_Guardians.git

# 2. 进入项目目录
cd Keycloak_Guardians

# 3. 切换到功能分支
git checkout feature/responsive-teams-page

# 4. 安装依赖
npm install

# 5. 启动开发服务器
npm run dev

# 6. 访问应用
打开浏览器访问 http://localhost:5173
```

**祝开发顺利！** 🚀
