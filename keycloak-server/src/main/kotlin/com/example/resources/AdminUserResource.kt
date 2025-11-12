package com.example.resources

import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.models.requests.CreateUserRequest
import com.example.models.responses.UserResponse
import jakarta.annotation.security.RolesAllowed
import com.example.utils.RoleUtils
import jakarta.enterprise.context.ApplicationScoped

@Path("/api/admin")
@ApplicationScoped
class AdminUserResource @Inject constructor(
    private val jwt: JsonWebToken
) {

    @GET
    @Path("/test")
    @Produces(MediaType.APPLICATION_JSON)
    fun testEndpoint(): Response {
        return Response.ok(mapOf(
            "message" to "Admin endpoint is working",
            "timestamp" to System.currentTimeMillis(),
            "jwtAvailable" to (jwt != null),
            "jwtName" to jwt.name
        )).build()
    }

    @POST
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)  // 确保这一行存在
    @RolesAllowed("admin")
    fun createUser(request: CreateUserRequest): Response {
        println("=== DEBUG: createUser called ===")
        println("=== DEBUG: Request received: $request ===")

        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        return try {
            println("=== DEBUG: Processing user creation ===")

            val newUser = UserResponse(
                id = "user-${System.currentTimeMillis()}",
                username = request.username,
                email = request.email,
                enabled = request.enabled,
                roles = request.roles
            )

            println("=== DEBUG: User created: $newUser ===")

            Response.status(Response.Status.CREATED)
                .entity(mapOf(
                    "message" to "用户创建成功",
                    "user" to mapOf(
                        "id" to newUser.id,
                        "username" to newUser.username,
                        "email" to newUser.email,
                        "enabled" to newUser.enabled,
                        "roles" to newUser.roles
                    )
                ))
                .build()
        } catch (e: Exception) {
            println("=== DEBUG: Exception: ${e.message} ===")
            e.printStackTrace()
            Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "创建用户失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")  // 只有admin角色可以查看所有用户
    fun getUsers(): Response {
        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        // 根据实际用户更新数据
        val users = listOf(
            UserResponse("1", "admin", "admin@example.com", true, listOf("admin", "user")),
            UserResponse("2", "alice", "alice@example.com", true, listOf("user")),
            UserResponse("3", "jdoe", "jdoe@example.com", true, listOf("user"))
        )

        return Response.ok(mapOf(
            "total" to users.size,
            "users" to users.map { user ->
                mapOf(
                    "id" to user.id,
                    "username" to user.username,
                    "email" to user.email,
                    "enabled" to user.enabled,
                    "roles" to user.roles
                )
            }
        )).build()
    }

    // 测试端点保持不变
    @POST
    @Path("/users/test")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    fun testCreateUser(body: String): Response {
        println("=== DEBUG: Raw request body: $body ===")
        return Response.ok(mapOf(
            "message" to "测试端点正常工作",
            "receivedBody" to body
        )).build()
    }

    @POST
    @Path("/users/simple")
    @Produces(MediaType.APPLICATION_JSON)
    fun createUserSimple(): Response {
        println("=== DEBUG: Simple endpoint called ===")
        return Response.ok(mapOf(
            "message" to "简单端点工作正常",
            "timestamp" to System.currentTimeMillis()
        )).build()
    }

    @POST
    @Path("/users/form")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    fun createUserFromForm(
        @FormParam("username") username: String?,
        @FormParam("email") email: String?
    ): Response {
        println("=== DEBUG: Form endpoint called ===")
        println("=== DEBUG: Username: $username, Email: $email ===")

        // 添加参数验证
        if (username.isNullOrBlank() || email.isNullOrBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "用户名和邮箱不能为空"))
                .build()
        }

        return Response.ok(mapOf(
            "message" to "表单端点工作正常",
            "username" to username,
            "email" to email,
            "timestamp" to System.currentTimeMillis()
        )).build()
    }
}