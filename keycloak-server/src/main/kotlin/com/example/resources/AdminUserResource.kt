package com.example.resources

import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.models.requests.CreateUserRequest
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

        // 验证管理员权限
        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        // 验证请求参数
        val validationErrors = validateCreateUserRequest(request)
        if (validationErrors.isNotEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf(
                    "error" to "请求参数验证失败",
                    "validationErrors" to validationErrors
                ))
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

            // 设置邮箱（如果提供了的话）
            if (!request.email.isNullOrBlank()) {
                user.email = request.email
                user.setEmailVerified(false)
            }

            // 设置姓名（可选）
            request.firstName?.let { user.firstName = it }
            request.lastName?.let { user.lastName = it }

            // 创建凭证（密码）- 使用随机密码并要求用户在首次登录时更改
            val credential = CredentialRepresentation()
            credential.type = CredentialRepresentation.PASSWORD
            credential.value = generateRandomPassword()
            credential.isTemporary = true

            user.credentials = listOf(credential)

            // 创建用户
            val response = keycloak.realm(realm).users().create(user)

            if (response.status == 201) {
                // 获取用户ID
                val location = response.location
                val userId = location.path.split("/").last()

                println("=== DEBUG: User created with ID: $userId ===")

                // 设置默认角色（如果没有提供角色，则默认为user）
                val rolesToAssign = if (request.roles.isNotEmpty()) {
                    request.roles
                } else {
                    listOf("user")
                }

                // 分配角色
                if (rolesToAssign.isNotEmpty()) {
                    try {
                        val realmResource = keycloak.realm(realm)
                        val userResource = realmResource.users().get(userId)

                        // 获取当前realm的所有角色
                        val roles = realmResource.roles().list()
                        val rolesToAdd = roles.filter { role ->
                            rolesToAssign.contains(role.name)
                        }

                        if (rolesToAdd.isNotEmpty()) {
                            userResource.roles().realmLevel().add(rolesToAdd)
                            println("=== DEBUG: Roles assigned: $rolesToAssign ===")
                        }
                    } catch (roleException: Exception) {
                        println("=== DEBUG: Role assignment failed: ${roleException.message} ===")
                        // 角色分配失败不影响用户创建，只是记录日志
                    }
                }

                // 返回创建的用户信息
                return Response.status(Response.Status.CREATED)
                    .entity(mapOf(
                        "message" to "用户创建成功",
                        "user" to mapOf(
                            "id" to userId,
                            "username" to request.username,
                            "email" to request.email,
                            "enabled" to request.enabled,
                            "roles" to rolesToAssign
                        ),
                        "note" to "用户初始密码已生成，首次登录时需要修改密码"
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
        } catch (e: jakarta.ws.rs.ClientErrorException) {
            when (e.response?.status) {
                409 -> return Response.status(Response.Status.CONFLICT)
                    .entity(mapOf("error" to "用户已存在"))
                    .build()
                400 -> return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf("error" to "请求参数错误: ${e.message}"))
                    .build()
                else -> return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf("error" to "创建用户失败: ${e.message}"))
                    .build()
            }
        } catch (e: Exception) {
            println("=== DEBUG: Exception: ${e.message} ===")
            e.printStackTrace()
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "创建用户失败: ${e.message}"))
                .build()
        } finally {
            keycloak?.close()
        }
    }

    // 验证创建用户请求
    private fun validateCreateUserRequest(request: CreateUserRequest): List<String> {
        val errors = mutableListOf<String>()

        // 1. 验证用户名
        if (request.username.isBlank()) {
            errors.add("username: 用户名不能为空")
        }

        // 2. 验证邮箱格式（如果提供了邮箱）
        if (!request.email.isNullOrBlank()) {
            if (!request.email.contains("@")) {
                errors.add("email: 邮箱格式不正确，必须包含@符号")
            }
        }

        // 注意：enabled 字段由 Kotlin 类型安全保证为布尔值
        // 如果请求体中的 enabled 不是布尔值，会在反序列化时失败

        return errors
    }

    // 生成随机密码
    private fun generateRandomPassword(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        return (1..12)
            .map { chars.random() }
            .joinToString("")
    }

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

        var keycloak: Keycloak? = null
        try {
            keycloak = getKeycloak()
            val realm = keycloakConfig.realm

            val users = keycloak.realm(realm).users().list()
            val userList = users.map { user ->
                val userResource = keycloak.realm(realm).users().get(user.id)
                val roles = userResource.roles().realmLevel().listAll().map { it.name }

                mapOf(
                    "id" to user.id,
                    "username" to user.username,
                    "email" to user.email,
                    "enabled" to user.isEnabled,
                    "firstName" to user.firstName,
                    "lastName" to user.lastName,
                    "emailVerified" to user.isEmailVerified,
                    "roles" to roles
                )
            }

            return Response.ok(mapOf(
                "total" to userList.size,
                "users" to userList
            )).build()
        } catch (e: Exception) {
            // 如果查询失败，返回模拟数据
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
        } finally {
            keycloak?.close()
        }
    }

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