# Keycloak_Guardians 后端服务运行指南

## 项目简介
本项目为 Keycloak 资源服务器后端，基于 Quarkus + Kotlin，支持 OIDC/JWT 校验，适配 Keycloak 作为统一认证授权中心。已集成典型用户、角色、权限自动化配置，便于前端和其他成员对接。

## 运行环境
- JDK 17+
- Gradle 8+
- Keycloak 22+（推荐使用 guardians realm，已提供 realm-import.json）

## 数据库准备（MySQL 8.0 + Flyway）
1. 安装并启动 MySQL 8.0，确保能通过 `mysql` CLI 连接。
2. 使用 root 账号执行以下 SQL（仅允许本机访问，其他成员拉仓库后在自己机器执行即可）：
    ```sql
    CREATE DATABASE IF NOT EXISTS iamkc DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS 'iamkc'@'localhost' IDENTIFIED BY 'iamkc';
    GRANT ALL PRIVILEGES ON iamkc.* TO 'iamkc'@'localhost';
    FLUSH PRIVILEGES;
    ```
3. （可选）根据实际环境修改 `MYSQL_JDBC_URL`、`MYSQL_USERNAME`、`MYSQL_PASSWORD` 环境变量，或直接编辑 `src/main/resources/application.properties`。
4. 运行 Flyway 迁移创建核心表（包含 `files`、`users`、`storage_usage_daily` 等元数据表，定义见 `src/main/resources/db/migration/*.sql`）：
    ```powershell
    cd keycloak-server
    ./gradlew flywayMigrate
    ```
5. 确认数据库内出现 `files`、`users`、`storage_usage_daily`、`groups`、`group_members`、`notifications` 等核心表以及 `flyway_schema_history` 记录后，再启动后端服务。

### 已创建的数据表速览
- `users`：绑定 Keycloak 用户，扩展显示名、状态、配额等后端字段
- `files`：文件元信息与生命周期状态
- `storage_usage_daily`：每日用户存储量快照
- `groups` / `group_members`：小组管理、成员角色与状态
- `notifications`：系统/协作/审核通知中心
- `trash_entries`：回收站保留记录
- `backups` / `backup_jobs` / `backup_notifications`：备份计划与执行结果
- `file_versions`：版本历史、差异指针与备注
- `tasks` / `task_assignments` / `submissions` / `submission_reviews`：任务分工、作业提交与审核
- `favorites` / `tags` / `file_tags`：收藏与标签体系
- `sharing_links` / `file_shares`：分享链接和细粒度权限

> 所有表定义位于 `src/main/resources/db/migration/V*.sql`，拉取仓库后只需运行 `./gradlew flywayMigrate` 或启动 `quarkusDev` 即会自动创建。

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
- `POST /api/admin/users`：创建一个用户
  - Header：
    - `Authorization: Bearer <access_token>`
    - `Contene-Type: application/json
  - Body选择raw输入(例)：
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

## Postman 测试集
- 集合文件：`postman/Keycloak-Guardians.postman_collection.json`
- 导入后先运行 **Auth / 获取 Token** 请求，会自动把 `access_token` 保存到 `{{access_token}}` 变量；随后依次测试 `GET /api/users/me`、`GET /api/user/stats` 等接口，断言会校验状态码与关键字段格式。
- 新增/更新接口完成后，请运行集合内 **User Stats / GET /api/user/stats** 请求验证返回结构是否符合文档（`API.md` / `docs/wiki/API.md`）。

---
如有疑问请联系后端负责人或查阅 Keycloak 官方文档。
