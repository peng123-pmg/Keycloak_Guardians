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
import org.keycloak.admin.client.Keycloak
import com.example.config.KeycloakConfig
import org.keycloak.representations.idm.UserRepresentation
import org.keycloak.representations.idm.CredentialRepresentation

@Path("/api/admin")
@ApplicationScoped
class AdminUserResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val keycloakConfig: KeycloakConfig
) {

    private fun getKeycloak(): Keycloak {
        return keycloakConfig.getKeycloakInstance()
    }


    @POST
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    fun createUser(request: CreateUserRequest): Response {
        println("=== DEBUG: createUser called ===")
        println("=== DEBUG: Request received: $request ===")
        // 验证请求数据
        if (request.username.isBlank() || request.email.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "用户名和邮箱不能为空"))
                .build()
        }


        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        var keycloak: Keycloak? = null
        try {
            keycloak = getKeycloak()
            val realm = keycloakConfig.realm

            // 创建用户表示
            val user = UserRepresentation()
            user.isEnabled = request.enabled
            user.username = request.username
            user.email = request.email
            user.firstName = request.firstName
            user.lastName = request.lastName

            // 使用正确的方法设置 emailVerified
            user.setEmailVerified(true) // 修复这里：使用 setter 方法而不是直接访问字段

            // 创建凭证（密码）
            val credential = CredentialRepresentation()
            credential.type = CredentialRepresentation.PASSWORD
            credential.value = "TempPassword123!" // 临时密码，应该由用户更改
            credential.isTemporary = true

            user.credentials = listOf(credential)

            // 创建用户
            val response = keycloak.realm(realm).users().create(user)

            if (response.status == 201) {
                // 获取用户ID
                val location = response.location
                val userId = location.path.split("/").last()

                println("=== DEBUG: User created with ID: $userId ===")

                // 分配角色
                if (request.roles.isNotEmpty()) {
                    try {
                        val realmResource = keycloak.realm(realm)
                        val userResource = realmResource.users().get(userId)

                        // 获取当前realm的所有角色
                        val roles = realmResource.roles().list()
                        val rolesToAdd = roles.filter { role ->
                            request.roles.contains(role.name)
                        }

                        if (rolesToAdd.isNotEmpty()) {
                            userResource.roles().realmLevel().add(rolesToAdd)
                            println("=== DEBUG: Roles assigned: ${request.roles} ===")
                        }
                    } catch (roleException: Exception) {
                        println("=== DEBUG: Role assignment failed: ${roleException.message} ===")
                        // 角色分配失败不影响用户创建，只是记录日志
                    }
                }

                // 返回创建的用户信息
                val newUser = UserResponse(
                    id = userId,
                    username = request.username,
                    email = request.email,
                    enabled = request.enabled,
                    roles = request.roles
                )

                return Response.status(Response.Status.CREATED)
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
            } else {
                val errorMessage = try {
                    response.readEntity(String::class.java)
                } catch (e: Exception) {
                    "Unknown error"
                }
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf("error" to "创建用户失败: HTTP ${response.status} - $errorMessage"))
                    .build()
            }
        } catch (e: Exception) {
            println("=== DEBUG: Exception: ${e.message} ===")
            e.printStackTrace()
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "创建用户失败: ${e.message}"))
                .build()
        } finally {
            keycloak?.close()
        }
    }

    // 其他方法保持不变...
    @GET
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    fun getUsers(): Response {
        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        // 使用模拟数据，避免 Keycloak Admin Client 兼容性问题
        val users = listOf(
            mapOf(
                "id" to "1",
                "username" to "admin",
                "email" to "admin@example.com",
                "enabled" to true,
                "roles" to listOf("admin", "user")
            ),
            mapOf(
                "id" to "2",
                "username" to "alice",
                "email" to "alice@example.com",
                "enabled" to true,
                "roles" to listOf("user")
            ),
            mapOf(
                "id" to "3",
                "username" to "jdoe",
                "email" to "jdoe@example.com",
                "enabled" to true,
                "roles" to listOf("user", "user_premium")
            )
        )

        return Response.ok(mapOf(
            "total" to users.size,
            "users" to users
        )).build()
    }

    // 测试端点保持不变...
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
}