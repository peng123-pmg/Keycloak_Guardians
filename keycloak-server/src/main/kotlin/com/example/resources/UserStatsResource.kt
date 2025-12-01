package com.example.resources

import com.example.services.UserStatsService
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import jakarta.annotation.security.RolesAllowed
import com.example.utils.RoleUtils
import jakarta.enterprise.context.ApplicationScoped

@Path("/api/user")
@ApplicationScoped
class UserStatsResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val statsService: UserStatsService
) {

    @GET
    @Path("/stats")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    fun getUserStats(): Response {
        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        return try {
            val stats = statsService.fetchStats()
            Response.ok(mapOf(
                "message" to "用户数据概览获取成功",
                "data" to stats
            )).build()
        } catch (e: Exception) {
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "获取统计数据失败: ${e.message}"))
                .build()
        }
    }
}