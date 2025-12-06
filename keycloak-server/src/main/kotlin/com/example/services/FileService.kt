// FileService.kt
package com.example.services

import com.example.models.responses.FileResponse
import jakarta.enterprise.context.ApplicationScoped
import java.io.InputStream  // 添加这个导入
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.security.MessageDigest
import java.sql.Connection
import java.time.OffsetDateTime
import java.util.UUID
import javax.sql.DataSource

@ApplicationScoped
class FileService(
    private val dataSource: DataSource
) {

    private val uploadDir = Paths.get("uploads")

    init {
        // 创建上传目录
        try {
            Files.createDirectories(uploadDir)
        } catch (e: Exception) {
            println("警告: 无法创建上传目录: ${e.message}")
        }
    }

    // 添加二进制流上传方法
    fun uploadFile(inputStream: InputStream, fileName: String, contentType: String, ownerId: String): FileResponse {
        dataSource.connection.use { conn ->
            // 生成唯一文件名
            val fileExtension = getFileExtension(fileName)
            val storageName = "${UUID.randomUUID()}$fileExtension"
            val storagePath = uploadDir.resolve(storageName)

            // 保存文件
            Files.copy(inputStream, storagePath, StandardCopyOption.REPLACE_EXISTING)

            val fileSize = Files.size(storagePath)
            val checksum = calculateChecksum(storagePath)

            // 保存文件元数据到数据库
            val sql = """
                INSERT INTO files (owner_id, owner_realm, file_name, storage_path, mime_type, size_bytes, checksum, status)
                VALUES (?, 'guardians', ?, ?, ?, ?, ?, 'ACTIVE')
            """.trimIndent()

            conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, ownerId)
                ps.setString(2, fileName) // 原始文件名
                ps.setString(3, storagePath.toString())
                ps.setString(4, contentType)
                ps.setLong(5, fileSize)
                ps.setString(6, checksum)
                ps.executeUpdate()

                // 获取生成的主键并确保 ResultSet 关闭
                ps.generatedKeys.use { generatedKeys ->
                    if (!generatedKeys.next()) {
                        throw RuntimeException("Failed to retrieve file ID")
                    }
                    val fileId = generatedKeys.getLong(1)

                    // 返回文件信息
                    return FileResponse(
                        id = fileId,
                        fileName = storageName,
                        originalName = fileName,
                        mimeType = contentType,
                        sizeBytes = fileSize,
                        ownerId = ownerId,
                        checksum = checksum,
                        status = "ACTIVE",
                        createdAt = OffsetDateTime.now(),
                        updatedAt = OffsetDateTime.now()
                    )
                }
            }
        }
    }

    fun listFiles(ownerId: String): List<FileResponse> {
        dataSource.connection.use { conn ->
            val sql = """
                SELECT id, file_name, storage_path, mime_type, size_bytes, owner_id, checksum, status, created_at, updated_at
                FROM files 
                WHERE owner_id = ? AND deleted_at IS NULL
                ORDER BY created_at DESC
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, ownerId)
                ps.executeQuery().use { rs ->
                    val files = mutableListOf<FileResponse>()
                    while (rs.next()) {
                        files.add(FileResponse(
                            id = rs.getLong("id"),
                            fileName = Paths.get(rs.getString("storage_path")).fileName.toString(),
                            originalName = rs.getString("file_name"),
                            mimeType = rs.getString("mime_type"),
                            sizeBytes = rs.getLong("size_bytes"),
                            ownerId = rs.getString("owner_id"),
                            checksum = rs.getString("checksum"),
                            status = rs.getString("status"),
                            createdAt = rs.getObject("created_at", OffsetDateTime::class.java),
                            updatedAt = rs.getObject("updated_at", OffsetDateTime::class.java)
                        ))
                    }
                    return files
                }
            }
        }
    }

    fun getFile(fileId: Long, ownerId: String): Pair<Path, String> {
        dataSource.connection.use { conn ->
            val sql = """
                SELECT storage_path, file_name, mime_type 
                FROM files 
                WHERE id = ? AND owner_id = ? AND deleted_at IS NULL
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, fileId)
                ps.setString(2, ownerId)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        val storagePath = rs.getString("storage_path")
                        val originalName = rs.getString("file_name")
                        val mimeType = rs.getString("mime_type")
                        return Pair(Paths.get(storagePath), originalName)
                    } else {
                        throw RuntimeException("File not found or access denied")
                    }
                }
            }
        }
    }

    private fun calculateChecksum(filePath: Path): String {
        val digest = MessageDigest.getInstance("SHA-256")
        Files.newInputStream(filePath).use { inputStream ->
            val buffer = ByteArray(8192)
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                digest.update(buffer, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    private fun getFileExtension(fileName: String): String {
        val lastDot = fileName.lastIndexOf(".")
        return if (lastDot != -1) fileName.substring(lastDot) else ""
    }
}