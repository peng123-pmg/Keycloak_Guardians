package com.example.resources

import com.example.models.requests.CreateGroupRequest
import com.example.models.requests.ShareFileToGroupRequest
import com.example.models.responses.GroupFilesResponse
import com.example.services.GroupService
import com.example.services.UserService
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import jakarta.annotation.security.RolesAllowed
import jakarta.enterprise.context.ApplicationScoped

@Path("/api/groups")
@ApplicationScoped
class GroupResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val groupService: GroupService,
    private val userService: UserService
) {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun createGroup(request: CreateGroupRequest): Response {
        return try {
            // 验证请求
            if (request.name.isBlank()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf<String, Any>("error" to "小组名称不能为空"))
                    .build()
            }

            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf<String, Any>("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 创建小组
            val group = groupService.createGroup(request, localUserId)

            Response.status(Response.Status.CREATED)
                .entity(mapOf<String, Any>(
                    "message" to "小组创建成功",
                    "group" to group
                ))
                .build()
        } catch (e: IllegalArgumentException) {
            Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf<String, Any>("error" to (e.message ?: "请求参数错误")))
                .build()
        } catch (e: jakarta.ws.rs.NotFoundException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "资源不存在"))
                .build()
        } catch (e: jakarta.ws.rs.ForbiddenException) {
            Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf<String, Any>("error" to "权限不足"))
                .build()
        } catch (e: jakarta.ws.rs.NotAuthorizedException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf<String, Any>("error" to "认证失败，请重新登录"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "创建小组失败: ${e.message}"))
                .build()
        }
    }

    @POST
    @Path("/{groupId}/files")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun shareFileToGroup(
        @PathParam("groupId") groupId: Long,
        request: ShareFileToGroupRequest
    ): Response {
        return try {
            // 验证请求
            if (request.fileId <= 0) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf<String, Any>("error" to "文件ID无效"))
                    .build()
            }

            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf<String, Any>("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 共享文件到小组
            groupService.shareFileToGroup(groupId, request, localUserId)

            Response.ok(mapOf<String, Any>(
                "message" to "文件已成功共享到小组",
                "groupId" to groupId,
                "fileId" to request.fileId,
                "permission" to request.permission
            )).build()
        } catch (e: IllegalArgumentException) {
            Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf<String, Any>("error" to (e.message ?: "请求参数错误")))
                .build()
        } catch (e: SecurityException) {
            Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf<String, Any>("error" to "权限不足: ${e.message}"))
                .build()
        } catch (e: jakarta.ws.rs.NotFoundException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "资源不存在"))
                .build()
        } catch (e: jakarta.ws.rs.NotAuthorizedException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf<String, Any>("error" to "认证失败，请重新登录"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "共享文件失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Path("/files")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun getGroupFiles(): Response {
        return try {
            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf<String, Any>("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取用户所在小组的文件
            val files = groupService.getGroupFiles(localUserId)

            if (files.isEmpty()) {
                Response.ok(mapOf<String, Any>(
                    "message" to "您还没有加入任何小组，或小组中没有共享文件",
                    "files" to emptyList<Any>(),
                    "total" to 0
                )).build()
            } else {
                Response.ok(GroupFilesResponse(
                    files = files,
                    total = files.size
                )).build()
            }
        } catch (e: jakarta.ws.rs.NotAuthorizedException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf<String, Any>("error" to "认证失败，请重新登录"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "获取组内文件失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun getUserGroups(): Response {
        return try {
            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf<String, Any>("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取用户所在的小组列表
            val groups = groupService.getUserGroups(localUserId)

            Response.ok(mapOf<String, Any>(
                "message" to "获取用户小组列表成功",
                "groups" to groups,
                "total" to groups.size
            )).build()
        } catch (e: jakarta.ws.rs.NotAuthorizedException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf<String, Any>("error" to "认证失败，请重新登录"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "获取用户小组列表失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Path("/{groupId}")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun getGroupDetails(@PathParam("groupId") groupId: Long): Response {
        return try {
            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf<String, Any>("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取小组详情（包含权限验证）
            val group = groupService.getGroupDetails(groupId, localUserId)

            Response.ok(mapOf<String, Any>(
                "message" to "获取小组详情成功",
                "group" to group
            )).build()
        } catch (e: SecurityException) {
            Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf<String, Any>("error" to "您不是该小组成员，无权查看详情"))
                .build()
        } catch (e: IllegalArgumentException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "小组不存在"))
                .build()
        } catch (e: jakarta.ws.rs.NotFoundException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "资源不存在"))
                .build()
        } catch (e: jakarta.ws.rs.NotAuthorizedException) {
            Response.status(Response.Status.UNAUTHORIZED)
                .entity(mapOf<String, Any>("error" to "认证失败，请重新登录"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "获取小组详情失败: ${e.message}"))
                .build()
        }
    }
}