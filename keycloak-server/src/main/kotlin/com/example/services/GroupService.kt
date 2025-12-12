package com.example.services

import com.example.models.requests.CreateGroupRequest
import com.example.models.requests.ShareFileToGroupRequest
import com.example.models.responses.GroupResponse
import com.example.models.responses.GroupFileResponse
import jakarta.enterprise.context.ApplicationScoped
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.sql.Connection
import java.sql.SQLException
import java.sql.SQLTransientException
import java.time.OffsetDateTime
import javax.sql.DataSource

@ApplicationScoped
class GroupService(
    private val dataSource: DataSource
) {

    data class GroupCreationResult(
        val created: Boolean,
        val group: GroupResponse
    )

    fun createGroup(request: CreateGroupRequest, creatorUserId: Long): GroupCreationResult {
        dataSource.connection.use { conn ->
            val existing = findGroupByName(conn, request.name)
            if (existing != null) {
                return GroupCreationResult(created = false, group = existing)
            }

            val groupSql = """
                INSERT INTO `groups` (realm, name, description, course_code, join_policy, member_limit, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
            """.trimIndent()

            conn.prepareStatement(groupSql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, "guardians")
                ps.setString(2, request.name)
                ps.setString(3, request.description)
                ps.setString(4, request.courseCode)
                ps.setString(5, request.joinPolicy)
                ps.setInt(6, request.memberLimit)
                ps.setLong(7, creatorUserId)
                ps.executeUpdate()

                ps.generatedKeys.use { keys ->
                    if (!keys.next()) {
                        throw RuntimeException("创建小组失败")
                    }
                    val groupId = keys.getLong(1)
                    addGroupMember(conn, groupId, creatorUserId, "ADMIN")
                    return GroupCreationResult(created = true, group = getGroupById(conn, groupId))
                }
            }
        }
    }

    fun getUserGroups(userId: Long): List<GroupResponse> {
        val sql = """
            SELECT g.*, gm.role as membership_role,
                   CASE WHEN g.created_by = gm.user_id THEN 1 ELSE 0 END as is_owner_flag,
                   COUNT(gm2.id) as member_count
            FROM `groups` g
            JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ? AND gm.status = 'ACTIVE'
            LEFT JOIN group_members gm2 ON gm2.group_id = g.id AND gm2.status = 'ACTIVE'
            WHERE g.status = 'ACTIVE'
            GROUP BY g.id, gm.role, is_owner_flag
            ORDER BY g.created_at DESC
        """.trimIndent()

        dataSource.connection.use { conn ->
            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, userId)
                ps.executeQuery().use { rs ->
                    val groups = mutableListOf<GroupResponse>()
                    while (rs.next()) {
                        groups.add(
                            GroupResponse(
                                id = rs.getLong("id"),
                                name = rs.getString("name"),
                                description = rs.getString("description"),
                                courseCode = rs.getString("course_code"),
                                joinPolicy = rs.getString("join_policy"),
                                memberLimit = rs.getInt("member_limit"),
                                status = rs.getString("status"),
                                createdBy = rs.getLong("created_by"),
                                memberCount = rs.getLong("member_count"),
                                createdAt = rs.getObject("created_at", OffsetDateTime::class.java),
                                updatedAt = rs.getObject("updated_at", OffsetDateTime::class.java),
                                membershipRole = rs.getString("membership_role"),
                                isOwner = rs.getInt("is_owner_flag") == 1
                            )
                        )
                    }
                    return groups
                }
            }
        }
    }

    fun getGroupDetails(groupId: Long, userId: Long): GroupResponse {
        dataSource.connection.use { conn ->
            if (!isGroupMember(conn, groupId, userId)) {
                throw SecurityException("用户不是小组成员")
            }

            val sql = """
                SELECT g.*, COUNT(gm.id) as member_count
                  FROM `groups` g
                  LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'ACTIVE'
                 WHERE g.id = ? AND g.status = 'ACTIVE'
                 GROUP BY g.id
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, groupId)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        return GroupResponse(
                            id = rs.getLong("id"),
                            name = rs.getString("name"),
                            description = rs.getString("description"),
                            courseCode = rs.getString("course_code"),
                            joinPolicy = rs.getString("join_policy"),
                            memberLimit = rs.getInt("member_limit"),
                            status = rs.getString("status"),
                            createdBy = rs.getLong("created_by"),
                            memberCount = rs.getLong("member_count"),
                            createdAt = rs.getObject("created_at", OffsetDateTime::class.java),
                            updatedAt = rs.getObject("updated_at", OffsetDateTime::class.java)
                        )
                    } else {
                        throw IllegalArgumentException("小组不存在")
                    }
                }
            }
        }
    }
    fun shareFileToGroup(groupId: Long, request: ShareFileToGroupRequest, userId: Long) {
        dataSource.connection.use { conn ->
            // 1. 验证用户是否是小组成员
            if (!isGroupMember(conn, groupId, userId)) {
                throw IllegalArgumentException("用户不是小组成员")
            }

            // 2. 验证文件存在且用户有权限
            val fileCheckSql = """
                SELECT id, owner_id FROM files 
                WHERE id = ? AND deleted_at IS NULL
            """.trimIndent()

            conn.prepareStatement(fileCheckSql).use { ps ->
                ps.setLong(1, request.fileId)
                ps.executeQuery().use { rs ->
                    if (!rs.next()) {
                        throw IllegalArgumentException("文件不存在")
                    }
                    // 检查用户是否是文件所有者或管理员
                    // 这里可以根据需求调整权限逻辑
                }
            }

            // 3. 记录文件共享关系
            val shareSql = """
                INSERT INTO file_shares (file_id, from_user_id, target_group_id, permission, status)
                VALUES (?, ?, ?, ?, 'ACTIVE')
                ON DUPLICATE KEY UPDATE permission = ?, status = 'ACTIVE'
            """.trimIndent()

            conn.prepareStatement(shareSql).use { ps ->
                ps.setLong(1, request.fileId)
                ps.setLong(2, userId)
                ps.setLong(3, groupId)
                ps.setString(4, request.permission)
                ps.setString(5, request.permission)
                ps.executeUpdate()
            }
        }
    }

    fun getGroupFiles(userId: Long): List<GroupFileResponse> {
        dataSource.connection.use { conn ->
            // 获取用户所在的所有小组
            val groupIds = getGroupIdsByUser(conn, userId)

            if (groupIds.isEmpty()) {
                return emptyList()
            }

            // 获取这些小组中的所有共享文件
            val placeholders = groupIds.joinToString(",") { "?" }
            val sql = """
                SELECT 
                    fs.id, fs.file_id, fs.target_group_id, fs.permission, fs.created_at as shared_at,
                    f.file_name as original_name, f.mime_type, f.size_bytes, f.owner_id, f.category,
                    u.username as shared_by_name
                FROM file_shares fs
                JOIN files f ON fs.file_id = f.id
                JOIN users u ON fs.from_user_id = u.id
                WHERE fs.target_group_id IN ($placeholders)
                AND fs.status = 'ACTIVE'
                AND f.deleted_at IS NULL
                ORDER BY fs.created_at DESC
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                groupIds.forEachIndexed { index, groupId ->
                    ps.setLong(index + 1, groupId)
                }
                ps.executeQuery().use { rs ->
                    val files = mutableListOf<GroupFileResponse>()
                    while (rs.next()) {
                        files.add(GroupFileResponse(
                            id = rs.getLong("id"),
                            fileId = rs.getLong("file_id"),
                            groupId = rs.getLong("target_group_id"),
                            fileName = rs.getString("original_name"),
                            originalName = rs.getString("original_name"),
                            mimeType = rs.getString("mime_type"),
                            category = rs.getString("category"),
                            sizeBytes = rs.getLong("size_bytes"),
                            ownerId = rs.getString("owner_id"),
                            sharedBy = rs.getString("shared_by_name"),
                            permission = rs.getString("permission"),
                            sharedAt = rs.getObject("shared_at", OffsetDateTime::class.java)
                        ))
                    }
                    return files
                }
            }
        }
    }

    fun deleteGroupFile(userId: Long, fileId: Long) {
        // 简单重试以降低死锁/事务回滚影响
        var attempt = 0
        while (true) {
            attempt++
            try {
                dataSource.connection.use { conn ->
                    conn.autoCommit = false
                    try {
                        // 仅允许小组创建者删除：通过直接关联 groups 表校验创建者，避免动态 IN 语法问题
                        val selectSql = """
                            SELECT fs.id, fs.target_group_id, f.storage_path
                              FROM file_shares fs
                              JOIN files f ON fs.file_id = f.id
                              JOIN `groups` g ON g.id = fs.target_group_id
                             WHERE fs.file_id = ?
                               AND fs.status = 'ACTIVE'
                               AND g.status = 'ACTIVE'
                               AND g.created_by = ?
                             LIMIT 1
                        """.trimIndent()

                        val shareRow = conn.prepareStatement(selectSql).use { ps ->
                            ps.setLong(1, fileId)
                            ps.setLong(2, userId)
                            ps.executeQuery().use { rs ->
                                if (rs.next()) mapOf(
                                    "id" to rs.getLong("id"),
                                    "targetGroupId" to rs.getLong("target_group_id"),
                                    "storagePath" to rs.getString("storage_path")
                                ) else null
                            }
                        } ?: throw SecurityException("文件不存在或无权访问")

                        val targetGroupId = shareRow["targetGroupId"] as Long
                        if (!isGroupOwner(conn, targetGroupId, userId)) {
                            throw SecurityException("仅小组创建者可删除共享文件")
                        }

                        val deleteSql = """
                            UPDATE file_shares
                               SET status = 'DELETED'
                             WHERE id = ?
                        """.trimIndent()
                        conn.prepareStatement(deleteSql).use { ps ->
                            ps.setLong(1, shareRow["id"] as Long)
                            ps.executeUpdate()
                        }

                        // 如果没有其他共享记录，清理孤立的物理文件记录（可选软清理）
                        val orphanCheck = """
                            SELECT COUNT(*) FROM file_shares WHERE file_id = ? AND status = 'ACTIVE'
                        """.trimIndent()
                        val hasOtherShares = conn.prepareStatement(orphanCheck).use { ps ->
                            ps.setLong(1, fileId)
                            ps.executeQuery().use { rs -> rs.next() && rs.getLong(1) > 0 }
                        }
                        if (!hasOtherShares) {
                            val markDeleted = """
                                UPDATE files SET deleted_at = CURRENT_TIMESTAMP, status = 'DELETED'
                                WHERE id = ? AND deleted_at IS NULL
                            """.trimIndent()
                            conn.prepareStatement(markDeleted).use { ps ->
                                ps.setLong(1, fileId)
                                ps.executeUpdate()
                            }
                            val storagePath = shareRow["storagePath"] as String?
                            if (!storagePath.isNullOrBlank()) {
                                runCatching { Files.deleteIfExists(Paths.get(storagePath)) }
                            }
                        }

                        conn.commit()
                        return
                    } catch (ex: Exception) {
                        conn.rollback()
                        throw ex
                    } finally {
                        conn.autoCommit = true
                    }
                }
            } catch (ex: SQLTransientException) {
                if (attempt >= 3) throw ex
                Thread.sleep(50L * attempt)
            }
        }
    }

    fun getSharedFile(userId: Long, fileId: Long): Pair<Path, String> {
        dataSource.connection.use { conn ->
            val groupIds = getGroupIdsByUser(conn, userId)
            if (groupIds.isEmpty()) throw SecurityException("用户不在任何小组")

            val placeholders = groupIds.joinToString(",") { "?" }
            val sql = """
                SELECT f.storage_path, f.file_name
                  FROM file_shares fs
                  JOIN files f ON fs.file_id = f.id
                 WHERE fs.file_id = ?
                   AND fs.target_group_id IN ($placeholders)
                   AND fs.status = 'ACTIVE'
                   AND f.deleted_at IS NULL
                 LIMIT 1
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                var idx = 1
                ps.setLong(idx++, fileId)
                groupIds.forEach { ps.setLong(idx++, it) }
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        val storagePath = rs.getString("storage_path")
                        val originalName = rs.getString("file_name")
                        val filePath = Paths.get(storagePath)
                        if (!Files.exists(filePath)) throw RuntimeException("文件不存在: $storagePath")
                        return filePath to originalName
                    } else {
                        throw SecurityException("文件不存在或无权访问")
                    }
                }
            }
        }
    }

    fun getGroupMembers(groupId: Long, requesterId: Long): List<GroupMemberDto> {
        dataSource.connection.use { conn ->
            if (!isGroupMember(conn, groupId, requesterId)) {
                throw SecurityException("用户不是小组成员")
            }

            val sql = """
                SELECT gm.id, gm.group_id, gm.user_id, gm.role, gm.status, gm.joined_at,
                       u.username, u.email, u.display_name
                FROM group_members gm
                JOIN users u ON gm.user_id = u.id
                WHERE gm.group_id = ? AND gm.status = 'ACTIVE'
                ORDER BY gm.joined_at ASC
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, groupId)
                ps.executeQuery().use { rs ->
                    val members = mutableListOf<GroupMemberDto>()
                    while (rs.next()) {
                        members.add(
                            GroupMemberDto(
                                id = rs.getLong("id"),
                                groupId = rs.getLong("group_id"),
                                userId = rs.getLong("user_id"),
                                username = rs.getString("username"),
                                displayName = rs.getString("display_name"),
                                email = rs.getString("email"),
                                role = rs.getString("role"),
                                joinedAt = rs.getObject("joined_at", OffsetDateTime::class.java)
                            )
                        )
                    }
                    return members
                }
            }
        }
    }

    fun inviteUserToGroup(groupId: Long, requesterId: Long, targetUserId: Long, role: String = "MEMBER") {
        dataSource.connection.use { conn ->
            if (!isGroupMember(conn, groupId, requesterId)) {
                throw SecurityException("邀请人不是小组成员")
            }

            if (!hasInvitePermission(conn, groupId, requesterId)) {
                throw SecurityException("没有邀请权限")
            }

            val existsSql = """
                SELECT COUNT(*) FROM group_members
                WHERE group_id = ? AND user_id = ? AND status = 'ACTIVE'
            """.trimIndent()

            conn.prepareStatement(existsSql).use { ps ->
                ps.setLong(1, groupId)
                ps.setLong(2, targetUserId)
                ps.executeQuery().use { rs ->
                    if (rs.next() && rs.getLong(1) > 0) {
                        throw IllegalStateException("用户已在小组中")
                    }
                }
            }

            addGroupMember(conn, groupId, targetUserId, role)
        }
    }

    fun deleteGroup(groupId: Long, requesterId: Long) {
        dataSource.connection.use { conn ->
            conn.autoCommit = false
            try {
                if (!isGroupOwner(conn, groupId, requesterId)) {
                    throw SecurityException("只有创建者可以删除小组")
                }

                markGroupInactive(conn, groupId)
                deactivateGroupMembers(conn, groupId)

                conn.commit()
            } catch (ex: Exception) {
                conn.rollback()
                throw ex
            } finally {
                conn.autoCommit = true
            }
        }
    }

    private fun addGroupMember(conn: Connection, groupId: Long, userId: Long, role: String) {
        val sql = """
            INSERT INTO group_members (group_id, user_id, role, status)
            VALUES (?, ?, ?, 'ACTIVE')
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.setLong(2, userId)
            ps.setString(3, role)
            ps.executeUpdate()
        }
    }

    private fun getGroupById(conn: Connection, groupId: Long): GroupResponse {
        val sql = """
            SELECT g.*, COUNT(gm.id) as member_count
            FROM `groups` g
            LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'ACTIVE'
            WHERE g.id = ?
            GROUP BY g.id
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.executeQuery().use { rs ->
                if (rs.next()) {
                    return GroupResponse(
                        id = rs.getLong("id"),
                        name = rs.getString("name"),
                        description = rs.getString("description"),
                        courseCode = rs.getString("course_code"),
                        joinPolicy = rs.getString("join_policy"),
                        memberLimit = rs.getInt("member_limit"),
                        status = rs.getString("status"),
                        createdBy = rs.getLong("created_by"),
                        memberCount = rs.getLong("member_count"),
                        createdAt = rs.getObject("created_at", OffsetDateTime::class.java),
                        updatedAt = rs.getObject("updated_at", OffsetDateTime::class.java)
                    )
                } else {
                    throw RuntimeException("小组不存在")
                }
            }
        }
    }

    private fun isGroupMember(conn: Connection, groupId: Long, userId: Long): Boolean {
        val sql = """
            SELECT COUNT(*) FROM group_members 
            WHERE group_id = ? AND user_id = ? AND status = 'ACTIVE'
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.setLong(2, userId)
            ps.executeQuery().use { rs ->
                return rs.next() && rs.getLong(1) > 0
            }
        }
    }

    private fun getGroupIdsByUser(conn: Connection, userId: Long): List<Long> {
        val sql = """
            SELECT group_id FROM group_members 
            WHERE user_id = ? AND status = 'ACTIVE'
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, userId)
            ps.executeQuery().use { rs ->
                val groupIds = mutableListOf<Long>()
                while (rs.next()) {
                    groupIds.add(rs.getLong("group_id"))
                }
                return groupIds
            }
        }
    }

    private fun findGroupByName(conn: Connection, name: String): GroupResponse? {
        val sql = """
            SELECT g.*, COUNT(gm.id) as member_count
            FROM `groups` g
            LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = 'ACTIVE'
            WHERE g.realm = ? AND g.name = ? AND g.status = 'ACTIVE'
            GROUP BY g.id
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setString(1, "guardians")
            ps.setString(2, name)
            ps.executeQuery().use { rs ->
                if (rs.next()) {
                    return GroupResponse(
                        id = rs.getLong("id"),
                        name = rs.getString("name"),
                        description = rs.getString("description"),
                        courseCode = rs.getString("course_code"),
                        joinPolicy = rs.getString("join_policy"),
                        memberLimit = rs.getInt("member_limit"),
                        status = rs.getString("status"),
                        createdBy = rs.getLong("created_by"),
                        memberCount = rs.getLong("member_count"),
                        createdAt = rs.getObject("created_at", OffsetDateTime::class.java),
                        updatedAt = rs.getObject("updated_at", OffsetDateTime::class.java)
                    )
                }
            }
        }
        return null
    }

    private fun isGroupOwner(conn: Connection, groupId: Long, userId: Long): Boolean {
        val sql = """
            SELECT created_by FROM `groups`
            WHERE id = ? AND status = 'ACTIVE'
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.executeQuery().use { rs ->
                return rs.next() && rs.getLong("created_by") == userId
            }
        }
    }

    private fun markGroupInactive(conn: Connection, groupId: Long) {
        val sql = """
            UPDATE `groups`
            SET status = 'INACTIVE', updated_at = NOW()
            WHERE id = ?
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            if (ps.executeUpdate() == 0) {
                throw IllegalArgumentException("小组不存在或已删除")
            }
        }
    }

    private fun deactivateGroupMembers(conn: Connection, groupId: Long) {
        val sql = """
            UPDATE group_members
            SET status = 'INACTIVE', updated_at = NOW()
            WHERE group_id = ?
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.executeUpdate()
        }
    }

    private fun hasInvitePermission(conn: Connection, groupId: Long, userId: Long): Boolean {
        val sql = """
            SELECT role FROM group_members
            WHERE group_id = ? AND user_id = ? AND status = 'ACTIVE'
        """.trimIndent()

        conn.prepareStatement(sql).use { ps ->
            ps.setLong(1, groupId)
            ps.setLong(2, userId)
            ps.executeQuery().use { rs ->
                if (!rs.next()) return false
                return when (rs.getString("role")) {
                    "ADMIN", "OWNER" -> true
                    else -> false
                }
            }
        }
    }

    data class GroupMemberDto(
        val id: Long,
        val groupId: Long,
        val userId: Long,
        val username: String?,
        val displayName: String?,
        val email: String?,
        val role: String,
        val joinedAt: OffsetDateTime
    )
}