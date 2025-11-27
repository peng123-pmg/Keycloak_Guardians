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

## 4. 统一约定
- 所有接口统一返回 JSON，失败时包含 `error` 字段。
- Postman 集合位于 `postman/Keycloak-Guardians.postman_collection.json`，用以验证字段格式与权限要求。

> Wiki 推送步骤：复制本文件内容到 GitHub Wiki 仓库（`*.wiki.git`），提交后通知团队即可。
