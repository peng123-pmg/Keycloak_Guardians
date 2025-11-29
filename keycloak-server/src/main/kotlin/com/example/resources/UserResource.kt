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
            val roles = RoleUtils.getRolesFromToken(jwt)

            // 根据用户名提供个性化的欢迎消息
            val welcomeMessage = when (jwt.name) {
                "admin" -> "欢迎回来，管理员!"
                "alice" -> "欢迎回来，Alice!"
                "jdoe" -> "欢迎回来，John!"
                else -> "欢迎回来, ${jwt.name ?: "用户"}!"
            }

            val userInfo = mapOf(
                "username" to jwt.name,
                "email" to jwt.getClaim<String>("email"),
                "roles" to roles,
                "userId" to jwt.getClaim<String>("sub"),
                "welcome" to welcomeMessage
            )
            Response.ok(userInfo).build()
        } catch (e: Exception) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf("error" to "无效的token: ${e.message}"))
                .build()
        }
    }
}