package com.example.resources

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import com.example.models.responses.UserStats
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
    @RolesAllowed("admin")  // 只有admin角色可以查看统计
    fun getUserStats(): Response {
        if (!RoleUtils.hasAdminRole(jwt)) {
            return Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足，需要管理员角色"))
                .build()
        }

        // 根据实际用户更新统计数据
        val stats = UserStats(
            totalUsers = 3,
            activeUsers = 3,
            newUsersToday = 0,
            userRoles = mapOf("admin" to 1, "user" to 3), // admin用户也有user角色
            registrationTrend = listOf(
                DailyRegistration("2024-01-01", 1),
                DailyRegistration("2024-01-02", 1),
                DailyRegistration("2024-01-03", 1)
            )
        )

        return Response.ok(mapOf(
            "message" to "用户数据概览获取成功",
            "data" to mapOf(
                "summary" to mapOf(
                    "总用户数" to stats.totalUsers,
                    "活跃用户" to stats.activeUsers,
                    "今日新增" to stats.newUsersToday
                ),
                "roleDistribution" to stats.userRoles.map { (role, count) ->
                    mapOf("角色" to role, "用户数" to count)
                },
                "registrationHistory" to stats.registrationTrend.map { trend ->
                    mapOf("日期" to trend.date, "注册人数" to trend.count)
                }
            ),
            "metadata" to mapOf(
                "生成者" to jwt.name,
                "生成时间" to SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date()),
                "timestamp" to System.currentTimeMillis()
            )
        )).build()
    }
}