1. 用户信息查询
1.1 基本信息
  请求路径：/api/users/me
  请求方式：GET
  接口描述：该接口用于返回当前登录用户的基本信息和角色
1.2 请求参数
  Authorization: Bearer <access_token>
1.3 响应数据
  参数格式：application/json
  参数说明：
  username：用户名
  email：邮箱
  roles：角色信息
  userId：用户ID
  welcome：请求成功返回信息
响应数据样例：
json
{
    "username": "admin",
    "email": "admin@example.com",
    "roles": [
        "admin",
        "user"
    ],
    "userId": "b8d3ef6b-09bb-49d2-8829-b23f46778636",
    "welcome": "欢迎回来，管理员!"
}

2. 用户信息概况
2.1 基本信息
  请求路径：/api/user/stats
  请求方式：GET
  接口描述：返回所有用户及其文件概况，需要 admin 角色

2.2 请求参数
  Authorization: Bearer <access_token>

2.3 响应数据
  参数格式：application/json
  字段说明：
  message：请求结果描述
  data.summary：概览信息
  totalOwners：至少上传过一次的用户数
  activeOwners：有 ACTIVE 文件的用户数
  totalFiles：有效文件总数
  storageUsedBytes：占用字节数
  storageUsedReadable：人类可读格式
  averageFileSizeBytes：平均单个文件大小
  data.filesByStatus：按状态统计
  data.topUsersByStorage：Top5 用户（文件数、存储量）
  data.generatedAt：生成时间 (ISO-8601)
响应示例：
json
{
  "message": "用户数据概览获取成功",
  "data": {
    "summary": {
      "totalOwners": 2,
      "activeOwners": 2,
      "totalFiles": 5,
      "storageUsedBytes": 7340032,
      "storageUsedReadable": "7.0 MB",
      "averageFileSizeBytes": 1468006
    },
    "filesByStatus": {
      "ACTIVE": 4,
      "ARCHIVED": 1
    },
    "topUsersByStorage": [
      {
        "ownerId": "user-123",
        "fileCount": 3,
        "storageBytes": 6291456
      }
    ],
    "generatedAt": "2025-11-23T10:43:21.123456Z"
  }
}
3. 用户管理
3.1 创建用户
  请求路径：/api/admin/users
  请求方式：POST
  接口描述：该接口用于创建一个用户
3.2 请求参数
  Authorization: Bearer <access_token>
  Content-Type：application/json
Body:
json
{
    "username": "<用户名>",
    "email": "<邮箱>",
    "firstName": "<姓>",
    "lastName": "<名>",
    "enabled": true,
    "roles": ["<角色>"]
}
3.3 响应数据
  参数格式：application/json
  参数说明：
  message：请求成功返回信息
  user：用户数据
  id：用户ID
  username：用户名
  email：邮箱
  enabled：是否启用
  roles：角色信息
响应数据样例：
json
{
    "message": "用户创建成功",
    "user": {
        "id": "user-1763119509679",
        "username": "testuser",
        "email": "test@example.com",
        "enabled": true,
        "roles": [
            "user"
        ]
    }
}
4. 文件管理
4.1 文件上传
  请求路径：/api/files
  请求方式：POST
  接口描述：该接口用于上传文件到服务器
4.1.1 请求参数
  Authorization: Bearer <access_token>
  Content-Type：application/octet-stream
  Headers:
  X-File-Name: <原始文件名>
  Body: 文件二进制数据

4.1.2 响应数据
  参数格式：application/json
  参数说明：
  message：请求成功返回信息
  file：文件数据
  id：文件ID
  fileName：服务器存储文件名
  originalName：原始文件名
  mimeType：文件类型
  sizeBytes：文件大小（字节）
  ownerId：上传者ID
  checksum：文件校验和
  status：文件状态
  createdAt：创建时间
  updatedAt：更新时间
响应数据样例：
json
{
    "message": "文件上传成功",
    "file": {
        "id": 1,
        "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.txt",
        "originalName": "test.txt",
        "mimeType": "text/plain",
        "sizeBytes": 1024,
        "ownerId": "b8d3ef6b-09bb-49d2-8829-b23f46778636",
        "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "status": "ACTIVE",
        "createdAt": "2025-11-29T10:30:00Z",
        "updatedAt": "2025-11-29T10:30:00Z"
    }
}
4.2 获取文件列表
  请求路径：/api/files
  请求方式：GET
  接口描述：该接口用于获取当前用户的文件列表
  4.2.1 请求参数
  Authorization: Bearer <access_token>
  4.2.2 响应数据
  参数格式：application/json
  参数说明：
  files：文件列表
  id：文件ID
  fileName：服务器存储文件名
  originalName：原始文件名
  mimeType：文件类型
  sizeBytes：文件大小（字节）
  ownerId：上传者ID
  checksum：文件校验和
  status：文件状态
  createdAt：创建时间
  updatedAt：更新时间
  total：文件总数
  totalSize：总文件大小（字节）
响应数据样例：
json
{
    "files": [
        {
            "id": 1,
            "fileName": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.txt",
            "originalName": "test.txt",
            "mimeType": "text/plain",
            "sizeBytes": 1024,
            "ownerId": "b8d3ef6b-09bb-49d2-8829-b23f46778636",
            "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "status": "ACTIVE",
            "createdAt": "2025-11-29T10:30:00Z",
            "updatedAt": "2025-11-29T10:30:00Z"
        }
    ],
    "total": 1,
    "totalSize": 1024
}
4.3 文件下载
  请求路径：/api/files/{id}
  请求方式：GET
  接口描述：该接口用于下载指定文件
4.3.1 请求参数
  Authorization: Bearer <access_token>
  Path Parameters:
  id：文件ID
4.3.2 响应数据
  参数格式：文件二进制流
  响应头：
  Content-Disposition: attachment; filename="<原始文件名>"
  Content-Type: <文件MIME类型>
  响应示例：
  状态码：200 OK
  响应体：文件二进制内容
  响应头：
  text
  Content-Disposition: attachment; filename="test.txt"
  Content-Type: text/plain

- 更多 API 示例与字段说明可在 `docs/wiki/API.md` 或 GitHub Wiki 中查看，保持与 Postman 集合同步。

## 数据库结构附录
- `files`：文件元信息和生命周期状态
- `users`：Keycloak 用户扩展字段
- `storage_usage_daily`：每日存储统计
- `groups` / `group_members`：小组、成员和角色
- `notifications`：消息通知中心
- `trash_entries`：回收站记录
- `backups` / `backup_jobs` / `backup_notifications`：备份计划与执行记录
- `file_versions`：文件版本历史
- `tasks` / `task_assignments` / `submissions` / `submission_reviews`：任务与作业协作
- `favorites` / `tags` / `file_tags`：收藏、标签体系
- `sharing_links` / `file_shares`：外部分享及权限控制

所有建表 SQL 位于 `keycloak-server/src/main/resources/db/migration/`，执行 `./gradlew flywayMigrate` 或启动 `quarkusDev` 会自动同步。
