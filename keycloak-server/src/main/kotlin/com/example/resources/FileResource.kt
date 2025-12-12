package com.example.resources

import com.example.models.responses.FileListResponse
import com.example.models.responses.FileUploadResponse
import com.example.services.FileService
import com.example.services.GroupService
import com.example.services.UserRepository
import com.example.services.UserService
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject
import jakarta.annotation.security.RolesAllowed
import java.io.InputStream
import jakarta.enterprise.context.ApplicationScoped
import java.nio.file.Files
import java.nio.file.Paths
import java.util.logging.Logger
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@Path("/api/files")
@ApplicationScoped
class FileResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val fileService: FileService,
    private val groupService: GroupService,
    private val userService: UserService,
    private val userRepository: UserRepository
) {

    private val logger = Logger.getLogger(FileResource::class.java.name)

    @POST
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun uploadFile(
        fileData: InputStream,
        @HeaderParam("X-File-Name") fileName: String,
        @HeaderParam("Content-Type") contentType: String?
    ): Response {
        val userId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        val decodedFileName = try {
            URLDecoder.decode(fileName, StandardCharsets.UTF_8)
        } catch (ex: IllegalArgumentException) {
            logger.warning("无法按 UTF-8 解码文件名，使用原始值: ${ex.message}")
            fileName
        }

        val normalizedFileName = decodedFileName.ifBlank { fileName }

        if (normalizedFileName.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf<String, Any>("error" to "文件名不能为空"))
                .build()
        }

        // 清理文件名，移除非法字符
        val cleanFileName = normalizedFileName.trim().replace(Regex("[<>:\"/\\\\|?*]"), "_")
        val finalFileName = if (cleanFileName.isBlank()) "unnamed_file" else cleanFileName

        return try {
            val fileRecord = fileService.uploadFile(fileData, finalFileName, contentType ?: "application/octet-stream", userId)

            logger.info("文件上传成功: fileName=$finalFileName, user=$userId")

            Response.status(Response.Status.CREATED)
                .entity(FileUploadResponse(
                    message = "文件上传成功",
                    file = fileRecord
                ))
                .build()
        } catch (e: Exception) {
            logger.severe("文件上传失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "文件上传失败"))
                .build()
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun listFiles(): Response {
        val userId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        val ownerCandidates = linkedSetOf<String>()
        ownerCandidates += userId

        val username = jwt.getClaim<String>("preferred_username") ?: jwt.name
        val realm = jwt.getClaim<String>("iss")?.substringAfterLast("/realms/") ?: "guardians"
        if (!username.isNullOrBlank()) {
            runCatching { userRepository.findByRealmAndUsername(realm, username) }
                .getOrNull()
                ?.keycloakUserId
                ?.takeIf { it.isNotBlank() }
                ?.let { ownerCandidates += it }
        }

        return try {
            val files = fileService.listFiles(ownerCandidates)
            val totalSize = files.sumOf { it.sizeBytes }


            Response.ok(FileListResponse(
                files = files,
                total = files.size,
                totalSize = totalSize
            )).build()
        } catch (e: Exception) {
            logger.severe("获取文件列表失败: ${e.javaClass.simpleName}")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "获取文件列表失败"))
                .build()
        }
    }

    @GET
    @Path("/{id}")
    @RolesAllowed("user", "admin")
    fun downloadFile(@PathParam("id") id: Long): Response {
        val keycloakUserId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        val username = jwt.getClaim<String>("preferred_username") ?: jwt.name ?: keycloakUserId
        val email = jwt.getClaim<String>("email")
        val localUserId = userService.getOrCreateLocalUserId(keycloakUserId, username, email)

        return try {
            // 先尝试个人文件下载，若非本人文件则回退到团队共享权限校验
            val (filePath, originalName) = runCatching {
                fileService.getFile(id, keycloakUserId)
            }.getOrElse {
                groupService.getSharedFile(localUserId, id)
            }

            if (!Files.exists(filePath)) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(mapOf<String, Any>("error" to "文件不存在"))
                    .build()
            }

            val fileBytes = Files.readAllBytes(filePath)
            val mimeType = Files.probeContentType(filePath) ?: "application/octet-stream"

            logger.info("文件下载成功: fileId=$id, user=$keycloakUserId")

            Response.ok(fileBytes)
                .header("Content-Disposition", "attachment; filename=\"$originalName\"")
                .type(mimeType)
                .build()
        } catch (e: SecurityException) {
            logger.warning("文件下载失败: 权限不足 - fileId=$id, user=$keycloakUserId")
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "文件不存在或无权访问"))
                .build()
        } catch (e: RuntimeException) {
            logger.warning("文件下载失败: 文件不存在或无权限 - fileId=$id, user=$keycloakUserId")
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "文件不存在或无权访问"))
                .build()
        } catch (e: Exception) {
            logger.severe("文件下载失败: ${e.javaClass.simpleName} - fileId=$id")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "文件下载失败"))
                .build()
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("user", "admin")
    fun deleteFile(@PathParam("id") id: Long): Response {
        val userId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        return try {
            fileService.deleteFile(id, userId)
            Response.ok(mapOf("message" to "文件删除成功")).build()
        } catch (e: RuntimeException) {
            logger.warning("删除文件失败: ${e.message}")
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "文件不存在或无权访问"))
                .build()
        } catch (e: Exception) {
            logger.severe("删除文件失败: ${e.javaClass.simpleName} - fileId=$id")
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "文件删除失败"))
                .build()
        }
    }
}