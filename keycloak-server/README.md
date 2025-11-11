# Keycloak_Guardians 后端服务运行指南

## 项目简介
本项目为 Keycloak 资源服务器后端，基于 Quarkus + Kotlin，支持 OIDC/JWT 校验，适配 Keycloak 作为统一认证授权中心。已集成典型用户、角色、权限自动化配置，便于前端和其他成员对接。

## 运行环境
- JDK 17+
- Gradle 8+
- Keycloak 22+（推荐使用 guardians realm，已提供 realm-import.json）

## 快速启动
1. **导入 Keycloak realm**
   - 登录 Keycloak 管理后台
   - 选择“添加 realm”，导入 `src/main/resources/realm-import.json`
   - 启动 guardians realm，确保 `backend-service` client 已启用

2. **启动后端服务**
   - 进入项目根目录：
     ```
     cd keycloak-server
     ```
   - 启动开发模式：
     ```
     ./gradlew quarkusDev
     ```
   - 服务默认监听端口：`8081`

3. **获取 Token（Postman 示例）**
   - 请求 URL：`http://localhost:8080/realms/guardians/protocol/openid-connect/token`
   - Body 类型：`x-www-form-urlencoded`
     - grant_type: password
     - client_id: backend-service
     - username: admin（或 alice、jdoe）
     - password: admin（或 alice、jdoe）
   - 获取 access_token 后，访问受保护接口：
     - URL：`http://localhost:8081/api/users/me`
     - Header：`Authorization: Bearer <access_token>`

## 典型接口
- `GET /api/users/me`：返回当前登录用户的基本信息和角色
- `GET /api/user/stats`：返回所有用户的统计信息
- `POST /api/users/me`：创建一个用户
  - Header：
    - `Authorization: Bearer <access_token>`
    - `Contene-Type: application/json****
  - Body(例)：
  {
  "username": "testuser",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "enabled": true,
  "roles": ["user"]
  }

## 常见问题
- 若 roles 字段为空，请检查 Keycloak realm 的 protocol mappers 配置，确保 access_token 中包含角色信息
- 若 Quarkus 启动报错，请确认 JDK/Gradle 版本和依赖完整

## 适配前端
- 前端可通过 OIDC 登录流程获取 access_token，带 token 访问后端受保护接口
- 推荐使用 axios/fetch 并设置 Authorization header

## 其他说明
- 如需扩展用户、角色、权限，请直接修改 `realm-import.json` 并重新导入
- 支持自定义 API 扩展，详见 `src/main/kotlin/com/example/`

---
如有疑问请联系后端负责人或查阅 Keycloak 官方文档。
