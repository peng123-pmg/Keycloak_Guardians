package com.example.resources

import jakarta.ws.rs.GET
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.utils.RoleUtils
import jakarta.enterprise.context.ApplicationScoped
import com.example.services.KeycloakUserProvisioner
import jakarta.annotation.security.RolesAllowed

@Path("/api/users")
@ApplicationScoped
class UserResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val keycloakUserProvisioner: KeycloakUserProvisioner
) {

    @GET
    @Path("/me")
    @Produces(MediaType.APPLICATION_JSON)
    fun getCurrentUser(): Response {
        return try {
            // 获取用户信息
            val userId = jwt.getClaim<String>("sub")
            val username = jwt.name
            val email = jwt.getClaim<String>("email")

            if (userId == null || username == null) {
                return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf("error" to "无效的token"))
                    .build()
            }

            // 从JWT中获取enabled字段
            val enabled = jwt.getClaim<Boolean>("enabled") ?: true

            // 检查用户是否被禁用 - 新增的验证
            if (!enabled) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(mapOf("error" to "用户已被禁用"))
                    .build()
            }

            val roles = RoleUtils.getRolesFromToken(jwt)
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
                "welcome" to welcomeMessage
            )
            Response.ok(userInfo).build()
        } catch (e: Exception) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf("error" to "无效的token: ${e.message}"))
                .build()
        }
    }

    @POST
    @Path("/bootstrap")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    fun bootstrapUsers(): Response {
        keycloakUserProvisioner.syncAllUsers()
        return Response.ok(mapOf("message" to "用户同步已触发"))
            .build()
    }
}