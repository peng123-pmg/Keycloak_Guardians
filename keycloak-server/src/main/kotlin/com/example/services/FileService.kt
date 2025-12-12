// FileService.kt
package com.example.services

import com.example.models.responses.FileResponse
import jakarta.enterprise.context.ApplicationScoped
import java.io.InputStream  
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.security.MessageDigest
import java.sql.Connection
import java.sql.SQLException
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
    fun uploadFile(inputStream: InputStream, fileName: String, contentType: String, ownerId: String, category: String = "other"): FileResponse {
        dataSource.connection.use { conn ->
            // 清理文件名，移除非法字符
            val cleanFileName = fileName.replace(Regex("[<>:\"/\\\\|?*]"), "_")

            // 生成唯一文件名
            val fileExtension = getFileExtension(cleanFileName)
            val storageName = "${UUID.randomUUID()}$fileExtension"
            val storagePath = uploadDir.resolve(storageName)

            // 确保上传目录存在
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir)
            }

            // 保存文件
            Files.copy(inputStream, storagePath, StandardCopyOption.REPLACE_EXISTING)

            val fileSize = Files.size(storagePath)
            val checksum = calculateChecksum(storagePath)

            // 保存文件元数据到数据库
            val sql = """
                INSERT INTO files (owner_id, owner_realm, file_name, storage_path, mime_type, category, size_bytes, checksum, status)
                VALUES (?, 'guardians', ?, ?, ?, ?, ?, ?, 'ACTIVE')
            """.trimIndent()

            conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, ownerId)
                ps.setString(2, fileName)
                ps.setString(3, storagePath.toString())
                ps.setString(4, contentType)
                ps.setString(5, category)
                ps.setLong(6, fileSize)
                ps.setString(7, checksum)
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
                        category = category,
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

    fun listFiles(ownerIds: Collection<String>, includeDeleted: Boolean = false, category: String? = null): List<FileResponse> {
        if (ownerIds.isEmpty()) return emptyList()

        dataSource.connection.use { conn ->
            val conditions = mutableListOf("owner_id IN (${ownerIds.joinToString(",") { "?" }})")
            if (!includeDeleted) conditions += "deleted_at IS NULL"
            category?.takeIf { it.isNotBlank() && it.lowercase() != "all" }?.let { conditions += "category = ?" }
            val whereClause = conditions.joinToString(" AND ")

            val sql = """
                SELECT id, file_name, storage_path, mime_type, category, size_bytes, owner_id, checksum, status, created_at, updated_at
                FROM files
                WHERE $whereClause
                ORDER BY created_at DESC
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                var index = 1
                ownerIds.forEach { ps.setString(index++, it) }
                if (category?.isNotBlank() == true && category.lowercase() != "all") {
                    ps.setString(index++, category)
                }
                ps.executeQuery().use { rs ->
                    val files = mutableListOf<FileResponse>()
                    while (rs.next()) {
                        files.add(rs.toFileResponse())
                    }
                    return files
                }
            }
        }
    }

    // 兼容旧调用，默认只按单一 ownerId 查询
    fun listFiles(ownerId: String, includeDeleted: Boolean = false, category: String? = null): List<FileResponse> =
        listFiles(listOf(ownerId), includeDeleted, category)

    fun getFile(fileId: Long, ownerId: String, includeDeleted: Boolean = false): Pair<Path, String> {
        dataSource.connection.use { conn ->
            val sql = """
            SELECT storage_path, file_name
            FROM files
            WHERE id = ? AND owner_id = ? ${if (!includeDeleted) "AND deleted_at IS NULL" else ""}
        """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, fileId)
                ps.setString(2, ownerId)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        val storagePath = rs.getString("storage_path")
                        val originalName = rs.getString("file_name")

                        // 确保文件存在
                        val filePath = Paths.get(storagePath)
                        if (!Files.exists(filePath)) {
                            throw RuntimeException("文件不存在: $storagePath")
                        }

                        return Pair(filePath, originalName)
                    } else {
                        throw RuntimeException("文件不存在或无权访问")
                    }
                }
            }
        }
    }

    fun deleteFile(fileId: Long, ownerId: String, softDelete: Boolean = true, reason: String? = null, expiresAt: OffsetDateTime? = null) {
        dataSource.connection.use { conn ->
            conn.autoCommit = false
            try {
                val fileQuery = """
                    SELECT storage_path, category FROM files
                    WHERE id = ? AND owner_id = ? AND deleted_at IS NULL
                    FOR UPDATE
                """.trimIndent()

                val fileRecord = conn.prepareStatement(fileQuery).use { ps ->
                    ps.setLong(1, fileId)
                    ps.setString(2, ownerId)
                    ps.executeQuery().use { rs ->
                        if (rs.next()) {
                            rs.getString("storage_path") to rs.getString("category")
                        } else {
                            throw RuntimeException("文件不存在或无权访问")
                        }
                    }
                }

                if (softDelete) {
                    val updateSql = """
                        UPDATE files SET status = 'DELETED', deleted_at = CURRENT_TIMESTAMP
                        WHERE id = ? AND owner_id = ? AND deleted_at IS NULL
                    """.trimIndent()
                    conn.prepareStatement(updateSql).use { ps ->
                        ps.setLong(1, fileId)
                        ps.setString(2, ownerId)
                        if (ps.executeUpdate() == 0) throw RuntimeException("文件删除失败或已被删除")
                    }

                    val trashSql = """
                        INSERT INTO trash_entries (file_id, deleted_by, original_category, delete_reason, expires_at)
                        VALUES (?, (SELECT id FROM users WHERE keycloak_user_id = ? LIMIT 1), ?, ?, ?)
                        ON DUPLICATE KEY UPDATE delete_reason = VALUES(delete_reason), expires_at = VALUES(expires_at)
                    """.trimIndent()
                    conn.prepareStatement(trashSql).use { ps ->
                        ps.setLong(1, fileId)
                        ps.setString(2, ownerId)
                        ps.setString(3, fileRecord.second)
                        ps.setString(4, reason)
                        if (expiresAt != null) ps.setObject(5, expiresAt) else ps.setNull(5, java.sql.Types.TIMESTAMP)
                        ps.executeUpdate()
                    }
                } else {
                    val forceDeleteSql = """
                        DELETE FROM files WHERE id = ? AND owner_id = ?
                    """.trimIndent()
                    conn.prepareStatement(forceDeleteSql).use { ps ->
                        ps.setLong(1, fileId)
                        ps.setString(2, ownerId)
                        ps.executeUpdate()
                    }
                    Files.deleteIfExists(Paths.get(fileRecord.first))
                }

                conn.commit()
            } catch (ex: Exception) {
                conn.rollback()
                throw ex
            } finally {
                conn.autoCommit = true
            }
        }
    }

    fun listTrash(ownerId: String): List<TrashFileRecord> {
        val sql = """
            SELECT t.id, f.id as file_id, f.file_name, f.category, t.original_category, t.delete_reason,
                   t.created_at as deleted_at, t.expires_at
            FROM trash_entries t
            JOIN files f ON t.file_id = f.id
            WHERE f.owner_id = ?
            ORDER BY t.created_at DESC
        """.trimIndent()
        dataSource.connection.use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, ownerId)
                ps.executeQuery().use { rs ->
                    val trash = mutableListOf<TrashFileRecord>()
                    while (rs.next()) {
                        trash += rs.toTrashRecord()
                    }
                    return trash
                }
            }
        }
    }

    fun restoreFileFromTrash(fileId: Long, ownerId: String) {
        dataSource.connection.use { conn ->
            conn.autoCommit = false
            try {
                val sql = """
                    UPDATE files SET status = 'ACTIVE', deleted_at = NULL
                    WHERE id = ? AND owner_id = ?
                """.trimIndent()
                conn.prepareStatement(sql).use { ps ->
                    ps.setLong(1, fileId)
                    ps.setString(2, ownerId)
                    if (ps.executeUpdate() == 0) throw RuntimeException("文件不存在或无权访问")
                }

                val deleteTrashSql = "DELETE FROM trash_entries WHERE file_id = ?"
                conn.prepareStatement(deleteTrashSql).use { ps ->
                    ps.setLong(1, fileId)
                    ps.executeUpdate()
                }

                conn.commit()
            } catch (ex: Exception) {
                conn.rollback()
                throw ex
            } finally {
                conn.autoCommit = true
            }
        }
    }

    fun purgeFile(fileId: Long, ownerId: String) {
        deleteFile(fileId, ownerId, softDelete = false)
        dataSource.connection.use { conn ->
            conn.prepareStatement("DELETE FROM trash_entries WHERE file_id = ?").use { ps ->
                ps.setLong(1, fileId)
                ps.executeUpdate()
            }
        }
    }

    private fun java.sql.ResultSet.toFileResponse(): FileResponse {
        return FileResponse(
            id = getLong("id"),
            fileName = Paths.get(getString("storage_path")).fileName.toString(),
            originalName = getString("file_name"),
            mimeType = getString("mime_type"),
            category = getString("category"),
            sizeBytes = getLong("size_bytes"),
            ownerId = getString("owner_id"),
            checksum = getString("checksum"),
            status = getString("status"),
            createdAt = getObject("created_at", OffsetDateTime::class.java),
            updatedAt = getObject("updated_at", OffsetDateTime::class.java)
        )
    }

    data class TrashFileRecord(
        val id: Long,
        val fileId: Long,
        val fileName: String,
        val category: String,
        val originalCategory: String?,
        val deleteReason: String?,
        val deletedAt: OffsetDateTime,
        val expiresAt: OffsetDateTime?
    )

    private fun java.sql.ResultSet.toTrashRecord(): TrashFileRecord {
        return TrashFileRecord(
            id = getLong("id"),
            fileId = getLong("file_id"),
            fileName = getString("file_name"),
            category = getString("category"),
            originalCategory = getString("original_category"),
            deleteReason = getString("delete_reason"),
            deletedAt = getObject("deleted_at", OffsetDateTime::class.java),
            expiresAt = getObject("expires_at", OffsetDateTime::class.java)
        )
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