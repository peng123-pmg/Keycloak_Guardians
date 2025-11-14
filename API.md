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

2.1.用户信息概况
请求路径：/api/user/stats
请求方式：GET
接口描述：该接口用于返回所有用户的统计信息

2.2 请求参数
Authorization: Bearer <access_token>

2.3 响应数据
参数格式：application/json
参数说明：
-message：请求成功返回信息
-datal：数据
-summary：数据总结
-roleDistribution：根据角色区分的用户信息
-registrationHistory：根据注册日期区分的用户信息
-metadata：请求成功的信息

响应数据样例：
{
    "message": "用户数据概览获取成功",
    "data": {
        "summary": {
            "总用户数": 3,
            "活跃用户": 3,
            "今日新增": 0
        },
        "roleDistribution": [
            {
                "角色": "admin",
                "用户数": 1
            },
            {
                "角色": "user",
                "用户数": 3
            }
        ],
        "registrationHistory": [
            {
                "日期": "2024-01-01",
                "注册人数": 1
            },
            {
                "日期": "2024-01-02",
                "注册人数": 1
            },
            {
                "日期": "2024-01-03",
                "注册人数": 1
            }
        ]
    },
    "metadata": {
        "生成者": "admin",
        "生成时间": "2025-11-14 19:18:13",
        "timestamp": 1763119093385
    }
}

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
