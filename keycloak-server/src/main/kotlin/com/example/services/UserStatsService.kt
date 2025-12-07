package com.example.services

import jakarta.enterprise.context.ApplicationScoped
import java.sql.Connection
import javax.sql.DataSource

@ApplicationScoped
class UserStatsService(
    private val dataSource: DataSource
) {

    fun fetchStats(): Map<String, Any> {
        dataSource.connection.use { conn ->
            val totalFiles = scalarLong(conn, "SELECT COUNT(*) FROM files WHERE deleted_at IS NULL")
            val storageUsedBytes = scalarLong(conn, "SELECT COALESCE(SUM(size_bytes),0) FROM files WHERE deleted_at IS NULL")
            val totalOwners = scalarLong(conn, "SELECT COUNT(DISTINCT owner_id) FROM files WHERE deleted_at IS NULL")
            val activeOwners = scalarLong(conn, "SELECT COUNT(DISTINCT owner_id) FROM files WHERE status = 'ACTIVE' AND deleted_at IS NULL")
            val filesByStatus = mapQuery(conn, "SELECT status, COUNT(*) FROM files GROUP BY status")
            val topUsers = topUsers(conn)

            // 简化返回结构，避免使用不一致的 UserStats 类
            return mapOf(
                "summary" to mapOf(
                    "totalOwners" to totalOwners,
                    "activeOwners" to activeOwners,
                    "totalFiles" to totalFiles,
                    "storageUsedBytes" to storageUsedBytes,
                    "storageUsedReadable" to humanReadable(storageUsedBytes),
                    "averageFileSizeBytes" to if (totalFiles > 0) storageUsedBytes / totalFiles else 0
                ),
                "filesByStatus" to filesByStatus,
                "topUsersByStorage" to topUsers,
                "generatedAt" to System.currentTimeMillis()
            )
        }
    }

    private fun scalarLong(conn: Connection, sql: String): Long = conn.prepareStatement(sql).use { ps ->
        ps.executeQuery().use { rs -> if (rs.next()) rs.getLong(1) else 0 }
    }

    private fun mapQuery(conn: Connection, sql: String): Map<String, Long> = conn.prepareStatement(sql).use { ps ->
        ps.executeQuery().use { rs ->
            val result = mutableMapOf<String, Long>()
            while (rs.next()) {
                result[rs.getString(1)] = rs.getLong(2)
            }
            result
        }
    }

    private fun topUsers(conn: Connection): List<Map<String, Any>> = conn.prepareStatement(
        """
            SELECT owner_id, COUNT(*) AS file_count, COALESCE(SUM(size_bytes),0) AS bytes
            FROM files
            WHERE deleted_at IS NULL
            GROUP BY owner_id
            ORDER BY bytes DESC
            LIMIT 5
        """.trimIndent()
    ).use { ps ->
        ps.executeQuery().use { rs ->
            val list = mutableListOf<Map<String, Any>>()
            while (rs.next()) {
                list.add(mapOf(
                    "ownerId" to rs.getString("owner_id"),
                    "fileCount" to rs.getLong("file_count"),
                    "storageBytes" to rs.getLong("bytes")
                ))
            }
            list
        }
    }

    private fun humanReadable(bytes: Long): String {
        if (bytes <= 0) return "0 B"
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        val digitGroups = (Math.log10(bytes.toDouble()) / Math.log10(1024.0)).toInt()
        return String.format("%.1f %s", bytes / Math.pow(1024.0, digitGroups.toDouble()), units[digitGroups])
    }
}