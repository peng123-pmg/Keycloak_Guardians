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
    > V5 迁移新增 `last_sync_source`、`last_sync_at`、`sync_attempts` 等字段，用于记录“登录即同步”元数据，如遇 checksum mismatch 可先执行 `./gradlew flywayRepair` 再迁移。

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
- users表新增字段说明（Flyway V5 迁移）：
  - `last_sync_source`：上次同步来源（如 "LOGIN_SYNC"、"MANUAL_SYNC"）
  - `last_sync_at`：上次同步时间戳
  - `sync_attempts`：累计同步尝试次数

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
- `GET /api/users/me`：当前用户信息
- `GET /api/user/stats`：全局统计（admin）
- `POST /api/admin/users`：创建用户（admin）
- 文件：`POST /api/files` 上传，`GET /api/files` 列表，`GET /api/files/{id}` 下载
- 小组与共享：
  - `POST /api/groups` 创建；`GET /api/groups` 我的组；`GET /api/groups/{groupId}` 详情；`DELETE /api/groups/{groupId}` 删除（仅创建者）
  - `POST /api/groups/{groupId}/files` 共享文件；`GET /api/groups/files` 组内文件；`DELETE /api/groups/files/{fileId}` 删除共享（仅创建者）
  - `GET /api/groups/{groupId}/members` 成员列表；`POST /api/groups/{groupId}/members` 邀请成员

## 常见问题
- 若 roles 字段为空，请检查 Keycloak realm 的 protocol mappers 配置，确保 access_token 中包含角色信息
- 若 Quarkus 启动报错，请确认 JDK/Gradle 版本和依赖完整

### 常见问题（用户同步）
- `iamkc.users` 中只有 `admin`：自动同步依赖用户访问受保护接口。realm 导入只影响 Keycloak 自库，不会自动写入业务库。可用 Postman 调用 `GET /api/users/me` 或 `POST /api/users/bootstrap`（管理员）触发 `UserSyncService` 批量写入。
- 通过 Postman 创建的新用户未出现在 `users` 表：已在 `/api/admin/users` 中集成 `KeycloakUserProvisioner.syncUserById`，确保成功创建后立即 upsert 本地记录；若仍缺失，请检查 Keycloak Admin API 权限或查看日志中的 `Failed to synchronize user ...`。

## 环境变量与配置
- 主要运行参数集中在 `keycloak-server/src/main/resources/application.properties`，默认连接本地 Keycloak (`http://localhost:8080/realms/guardians`) 与 MySQL (`jdbc:mysql://localhost:3306/iamkc`).
- 用户同步相关开关：
  - `user.sync.enabled=true` 控制是否在请求链路自动 upsert Keycloak 用户。
  - `user.sync.default-quota-bytes=10737418240` 可按需调整业务层默认配额。
- 如需自定义端口或 CORS，可修改 `quarkus.http.*` / `quarkus.http.cors.*` 设置后重启。

## 适配前端
- 前端可通过 OIDC 登录流程获取 access_token，带 token 访问后端受保护接口
- 推荐使用 axios/fetch 并设置 Authorization header

## Postman 测试集
- 集合文件：`postman/Keycloak-Guardians.postman_collection.json`
- 导入后先运行 **Auth / 获取 Token** 请求，会自动把 `access_token` 保存到 `{{access_token}}` 变量；随后依次测试 `GET /api/users/me`、`GET /api/user/stats` 等接口，断言会校验状态码与关键字段格式。
- 新增请求 **System -> 自检 -> /api/user/stats**，加入断言验证 `summary.totalOwners` 与 `topUsersByStorage` 字段；执行前确保至少有一位登录用户完成同步。
- 新增/更新接口完成后，请运行集合内 **User Stats / GET /api/user/stats** 请求验证返回结构是否符合文档（`API.md` / `docs/wiki/API.md`）。

## 常用命令
```powershell
cd D:\keycloak\Keycloak_Guardians\keycloak-server
./gradlew quarkusDev
```
- 启动后可用 Postman 或 curl 调用：
```bash
curl -X POST "http://localhost:8081/api/users/bootstrap" \
     -H "Authorization: Bearer <admin_token>"
```

---
如有疑问请联系后端负责人或查阅 Keycloak 官方文档。
