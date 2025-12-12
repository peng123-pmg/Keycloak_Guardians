# IAM-KC API 文档（Wiki 版本）

> 本文件会同步 GitHub Wiki，保持与项目 `API.md` 一致。下文仅包含关键接口，更多场景可参考源码。

## 1. `GET /api/users/me`
- **描述**：返回当前登录用户信息
- **鉴权**：Bearer Token
- **响应示例**：参考仓库根目录 `API.md`

## 2. `GET /api/user/stats`
- **描述**：管理员查看用户与文件全局态势
- **鉴权**：需要 `admin` 角色
- **返回字段**：
  - `summary.totalOwners`、`summary.activeOwners`
  - `summary.totalFiles`、`summary.storageUsedBytes`
  - `summary.storageUsedReadable`、`summary.averageFileSizeBytes`
  - `filesByStatus`：各状态统计
  - `topUsersByStorage`：Top5 用户的文件数与占用
  - `generatedAt`：ISO-8601 时间戳
- **响应示例**：与项目 `API.md` 中 2.3 节一致

## 3. `POST /api/admin/users`
- **描述**：管理员创建 Keycloak 用户
- **鉴权**：`admin`
- **请求体**：用户名、邮箱、姓名、启用状态、角色数组
- **响应**：成功返回用户 ID 与基础信息

## 4. 小组与团队文件
- **POST /api/groups/{groupId}/files**：共享文件到小组（成员可操作）
- **GET /api/groups/files**：获取我所在小组的共享文件列表
- **DELETE /api/groups/files/{fileId}**：删除共享文件（仅小组创建者；若无其他共享会软删除文件）
- **GET /api/files/{id}**：下载文件（包含团队共享的访问校验）
- **GET /api/groups/{groupId}/members**：成员列表
- **POST /api/groups/{groupId}/members**：邀请成员
- **DELETE /api/groups/{groupId}**：删除小组（仅创建者）

## 4. 统一约定
- 所有接口统一返回 JSON，失败时包含 `error` 字段。
- Postman 集合位于 `postman/Keycloak-Guardians.postman_collection.json`，用以验证字段格式与权限要求。

## 5. 数据库结构与初始化
- 已启用 Flyway 自动迁移，所有建表脚本位于 `keycloak-server/src/main/resources/db/migration/V*.sql`
- 核心表：`users`、`files`、`storage_usage_daily`、`groups`、`group_members`、`notifications`、`trash_entries`
- 协作表：`tasks`、`task_assignments`、`submissions`、`submission_reviews`
- 其他能力：`backups`/`backup_jobs`/`backup_notifications`、`file_versions`、`favorites`、`tags`/`file_tags`、`sharing_links`/`file_shares`
- 初始化步骤：
  1. 本地 MySQL 8.0 执行 README 中的创建库和账号 SQL
  2. 进入 `keycloak-server` 运行 `./gradlew flywayMigrate` 或 `./gradlew quarkusDev`
  3. 校验 `iamkc` 库中已生成所有表和 `flyway_schema_history`

## 6. 用户同步工具
- `POST /api/users/bootstrap`：管理员触发 Keycloak ➜ iamkc 批量同步（调用 `KeycloakUserProvisioner.syncAllUsers`）。接口返回 `{ "message": "用户同步已触发" }`。用于首次导入 realm 后批量填充本地 `users` 表。

## 7. 配置与环境
- 默认配置保存在 `keycloak-server/src/main/resources/application.properties`，包含 OIDC、HTTP、MySQL、CORS、用户同步等参数。修改后需重新启动 `./gradlew quarkusDev`。

> 本 Wiki 与根目录 `API.md`、Postman 集合同步维护，更新接口或数据表时务必同时修改。

> Wiki 推送步骤：复制本文件内容到 GitHub Wiki 仓库（`*.wiki.git`），提交后通知团队即可。
