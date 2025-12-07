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
import java.util.logging.Logger

@Path("/api/groups")
@ApplicationScoped
class GroupResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val groupService: GroupService,
    private val userService: UserService
) {

    private val logger = Logger.getLogger(GroupResource::class.java.name)

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun createGroup(request: CreateGroupRequest): Response {
        return try {
            // 验证请求
            if (request.name.isBlank()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(mapOf("error" to "小组名称不能为空"))
                    .build()
            }

            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 创建小组
            val group = groupService.createGroup(request, localUserId)

            logger.info("小组创建成功: name=${request.name}, creator=$username")

            Response.status(Response.Status.CREATED)
                .entity(mapOf(
                    "message" to "小组创建成功",
                    "group" to mapOf(
                        "id" to group.id,
                        "name" to group.name,
                        "description" to group.description
                    )
                ))
                .build()
        } catch (e: IllegalArgumentException) {
            logger.warning("创建小组失败: ${e.message}")
            Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "请求参数错误"))
                .build()
        } catch (e: Exception) {
            logger.severe("创建小组失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "创建小组失败"))
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
                    .entity(mapOf("error" to "文件ID无效"))
                    .build()
            }

            // 获取当前用户信息
            val keycloakUserId = jwt.getClaim<String>("sub")
                ?: return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(mapOf("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 共享文件到小组
            groupService.shareFileToGroup(groupId, request, localUserId)

            logger.info("文件共享成功: groupId=$groupId, fileId=${request.fileId}, user=$username")

            Response.ok(mapOf(
                "message" to "文件已成功共享到小组",
                "groupId" to groupId,
                "fileId" to request.fileId
            )).build()
        } catch (e: SecurityException) {
            logger.warning("文件共享失败: 权限不足 - ${e.message}")
            Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "权限不足"))
                .build()
        } catch (e: IllegalArgumentException) {
            logger.warning("文件共享失败: 参数错误 - ${e.message}")
            Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf("error" to "请求参数错误"))
                .build()
        } catch (e: Exception) {
            logger.severe("文件共享失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "共享文件失败"))
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
                    .entity(mapOf("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取用户所在小组的文件
            val files = groupService.getGroupFiles(localUserId)

            if (files.isEmpty()) {
                Response.ok(mapOf(
                    "message" to "没有找到共享文件",
                    "files" to emptyList<Any>(),
                    "total" to 0
                )).build()
            } else {
                // 移除敏感信息
                val safeFiles = files.map { file ->
                    mapOf(
                        "fileId" to file.fileId,
                        "fileName" to file.fileName,
                        "sharedBy" to file.sharedBy,
                        "sharedAt" to file.sharedAt
                    )
                }

                Response.ok(GroupFilesResponse(
                    files = files,
                    total = files.size
                )).build()
            }
        } catch (e: Exception) {
            logger.severe("获取组内文件失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "获取组内文件失败"))
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
                    .entity(mapOf("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取用户所在的小组列表
            val groups = groupService.getUserGroups(localUserId)

            Response.ok(mapOf(
                "message" to "获取用户小组列表成功",
                "groups" to groups,
                "total" to groups.size
            )).build()
        } catch (e: Exception) {
            logger.severe("获取用户小组列表失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "获取用户小组列表失败"))
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
                    .entity(mapOf("error" to "无效的token"))
                    .build()

            val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
            val email = jwt.getClaim<String>("email")

            // 获取或创建本地用户ID
            val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

            // 获取小组详情（包含权限验证）
            val group = groupService.getGroupDetails(groupId, localUserId)

            Response.ok(mapOf(
                "message" to "获取小组详情成功",
                "group" to mapOf(
                    "id" to group.id,
                    "name" to group.name,
                    "description" to group.description,
                    "memberCount" to group.memberCount
                )
            )).build()
        } catch (e: SecurityException) {
            logger.warning("获取小组详情失败: 权限不足 - groupId=$groupId")
            Response.status(Response.Status.FORBIDDEN)
                .entity(mapOf("error" to "您不是该小组成员，无权查看详情"))
                .build()
        } catch (e: IllegalArgumentException) {
            logger.warning("获取小组详情失败: 小组不存在 - groupId=$groupId")
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf("error" to "小组不存在"))
                .build()
        } catch (e: Exception) {
            logger.severe("获取小组详情失败: ${e.javaClass.simpleName} - groupId=$groupId")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf("error" to "获取小组详情失败"))
                .build()
        }
    }
}