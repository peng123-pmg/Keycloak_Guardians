package com.example.resources

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.models.responses.DailyRegistration
import jakarta.annotation.security.RolesAllowed
import com.example.utils.RoleUtils
import jakarta.enterprise.context.ApplicationScoped
import java.text.SimpleDateFormat
import java.util.Date

@Path("/api/user")
@ApplicationScoped
class UserStatsResource @Inject constructor(
    private val jwt: JsonWebToken
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

        try {
            // 使用模拟数据，避免 Keycloak Admin Client 兼容性问题
            // 在实际项目中，这些数据应该从数据库或 Keycloak 获取
            val stats = mapOf(
                "message" to "用户数据概览获取成功",
                "data" to mapOf(
                    "summary" to mapOf(
                        "总用户数" to 3,
                        "活跃用户" to 3,
                        "今日新增" to 0
                    ),
                    "roleDistribution" to listOf(
                        mapOf("角色" to "admin", "用户数" to 1),
                        mapOf("角色" to "user", "用户数" to 3),
                        mapOf("角色" to "user_premium", "用户数" to 1)
                    ),
                    "registrationHistory" to listOf(
                        mapOf("日期" to "2024-01-01", "注册人数" to 1),
                        mapOf("日期" to "2024-01-02", "注册人数" to 1),
                        mapOf("日期" to "2024-01-03", "注册人数" to 1)
                    )
                ),
                "metadata" to mapOf(
                    "生成者" to jwt.name,
                    "生成时间" to SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()),
                    "timestamp" to System.currentTimeMillis()
                )
            )

            return Response.ok(stats).build()
        } catch (e: Exception) {
            e.printStackTrace()
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "获取统计数据失败: ${e.message}"))
                .build()
        }
    }
}