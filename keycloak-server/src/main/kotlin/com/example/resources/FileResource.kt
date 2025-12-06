package com.example.resources

import com.example.models.responses.FileListResponse
import com.example.models.responses.FileUploadResponse
import com.example.services.FileService
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

@Path("/api/files")
@ApplicationScoped
class FileResource @Inject constructor(
    private val jwt: JsonWebToken,
    private val fileService: FileService
) {

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

        if (fileName.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(mapOf<String, Any>("error" to "文件名不能为空"))
                .build()
        }

        // 清理文件名，移除非法字符
        val cleanFileName = fileName.trim().replace(Regex("[<>:\"/\\\\|?*]"), "_")
        val finalFileName = if (cleanFileName.isBlank()) "unnamed_file" else cleanFileName

        return try {
            val fileRecord = fileService.uploadFile(fileData, finalFileName, contentType ?: "application/octet-stream", userId)
            Response.status(Response.Status.CREATED)
                .entity(FileUploadResponse(
                    message = "文件上传成功",
                    file = fileRecord
                ))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "文件上传失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("user", "admin")
    fun listFiles(): Response {
        val userId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        return try {
            val files = fileService.listFiles(userId)
            val totalSize = files.sumOf { it.sizeBytes }
            Response.ok(FileListResponse(
                files = files,
                total = files.size,
                totalSize = totalSize
            )).build()
        } catch (e: Exception) {
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "获取文件列表失败: ${e.message}"))
                .build()
        }
    }

    @GET
    @Path("/{id}")
    @RolesAllowed("user", "admin")
    fun downloadFile(@PathParam("id") id: Long): Response {
        val userId = jwt.getClaim<String>("sub") ?: return Response.status(Response.Status.UNAUTHORIZED)
            .entity(mapOf<String, Any>("error" to "无法获取用户ID")).build()

        return try {
            val (filePath, originalName) = fileService.getFile(id, userId)

            if (!Files.exists(filePath)) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(mapOf<String, Any>("error" to "文件不存在"))
                    .build()
            }

            val fileBytes = Files.readAllBytes(filePath)
            val mimeType = Files.probeContentType(filePath) ?: "application/octet-stream"

            Response.ok(fileBytes)
                .header("Content-Disposition", "attachment; filename=\"$originalName\"")
                .type(mimeType)
                .build()
        } catch (e: RuntimeException) {
            Response.status(Response.Status.NOT_FOUND)
                .entity(mapOf<String, Any>("error" to "文件不存在或无权访问: ${e.message}"))
                .build()
        } catch (e: Exception) {
            e.printStackTrace()
            Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(mapOf<String, Any>("error" to "文件下载失败: ${e.message}"))
                .build()
        }
    }
}