package com.example.resources

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.utils.RoleUtils
import jakarta.enterprise.context.ApplicationScoped

@Path("/api/users")
@ApplicationScoped
class UserResource @Inject constructor(
    private val jwt: JsonWebToken
) {

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    fun getCurrentUser(): Response {
        return try {
            // 从JWT中获取用户信息
            val userId = jwt.getClaim<String>("sub")

            // 检查JWT是否有效
            if (userId == null || jwt.name == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf("error" to "无效的token"))
                    .build()
            }

            // 获取用户信息
            val email = jwt.getClaim<String>("email")
            val username = jwt.name
            val isEnabled = jwt.getClaim<Boolean>("enabled") ?: true

            // 检查用户是否被禁用
            if (!isEnabled) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(mapOf("error" to "用户已被禁用"))
                    .build()
            }

            // 获取用户角色
            val roles = RoleUtils.getRolesFromToken(jwt)

            // 生成个性化的欢迎消息
            val welcomeMessage = when (username.lowercase()) {
                "admin" -> "欢迎回来，管理员!"
                "alice" -> "欢迎回来，Alice!"
                "jdoe" -> "欢迎回来，John!"
                else -> "欢迎回来, $username!"
            }

            val userInfo = mapOf(
                "username" to username,
                "email" to email,
                "roles" to roles,
                "userId" to userId,
                "enabled" to isEnabled,
                "welcome" to welcomeMessage,
                "timestamp" to System.currentTimeMillis()
            )

            Response.ok(userInfo).build()
        } catch (e: Exception) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf("error" to "无效的token: ${e.message}"))
                .build()
        }
    }
}