1. 用户信息查询
1.1.基本信息
请求路径：/api/users/me
请求方式：GET
接口描述：该接口用于返回当前登录用户的基本信息和角色

1.2 请求参数
Authorization: Bearer <access_token>

1.3 响应数据
参数格式：application/json
参数说明：
-username：用户名
-email：邮箱
-roles：角色信息
-userId：用户ID
-welcome：请求成功返回信息

响应数据样例：
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
- message：请求结果描述
- data.summary：概览信息
  - totalOwners：至少上传过一次的用户数
  - activeOwners：有 ACTIVE 文件的用户数
  - totalFiles：有效文件总数
  - storageUsedBytes：占用字节数
  - storageUsedReadable：人类可读格式
  - averageFileSizeBytes：平均单个文件大小
- data.filesByStatus：按状态统计
- data.topUsersByStorage：Top5 用户（文件数、存储量）
- data.generatedAt：生成时间 (ISO-8601)

响应示例：
```
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
```

3. 用户管理
3.1 创建用户
请求路径：/api/admin/users
请求方式：POST
接口描述：该接口用于创建一个用户

3.2 请求参数
Authorization: Bearer <access_token>
Content-Type：application/json
body:{
    "username": "<用户名>",
    "email": "<邮箱>",
    "firstName": "<姓>",
    "lastName": "<名>",
    "enabled": <true,
    "roles": ["<角色>"]
}
3.3 响应数据
参数格式：application/json
参数说明：
-message：请求成功返回信息
-user：用户数据
-id：用户ID
-username：用户名
-email：邮箱
-enabled：是否启用
-roles：角色信息

响应数据样例：
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
