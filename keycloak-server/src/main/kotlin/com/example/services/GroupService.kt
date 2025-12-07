package com.example.services

import com.example.models.requests.CreateGroupRequest
import com.example.models.requests.ShareFileToGroupRequest
import com.example.models.responses.GroupResponse
import com.example.models.responses.GroupFileResponse
import jakarta.enterprise.context.ApplicationScoped
import java.sql.Connection
import java.time.OffsetDateTime
import javax.sql.DataSource

@ApplicationScoped
class GroupService(
    private val dataSource: DataSource
) {

    fun createGroup(request: CreateGroupRequest, creatorUserId: Long): GroupResponse {
        dataSource.connection.use { conn ->
            // 1. 创建小组
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

                // 获取生成的小组ID
                ps.generatedKeys.use { keys ->
                    if (!keys.next()) {
                        throw RuntimeException("创建小组失败")
                    }
                    val groupId = keys.getLong(1)

                    // 2. 将创建者添加为管理员
                    addGroupMember(conn, groupId, creatorUserId, "ADMIN")

                    // 3. 返回创建的小组信息
                    return getGroupById(conn, groupId)
                }
            }
        }
    }

    fun getUserGroups(userId: Long): List<GroupResponse> {
        dataSource.connection.use { conn ->
            val sql = """
            SELECT g.*, COUNT(gm.id) as member_count
            FROM `groups` g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = ? AND gm.status = 'ACTIVE' AND g.status = 'ACTIVE'
            GROUP BY g.id
            ORDER BY g.updated_at DESC
        """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setLong(1, userId)
                ps.executeQuery().use { rs ->
                    val groups = mutableListOf<GroupResponse>()
                    while (rs.next()) {
                        groups.add(GroupResponse(
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
                        ))
                    }
                    return groups
                }
            }
        }
    }

    fun getGroupDetails(groupId: Long, userId: Long): GroupResponse {
        dataSource.connection.use { conn ->
            // 先验证用户是否是小组成员
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
                    f.file_name, f.mime_type, f.size_bytes, f.owner_id,
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
                            fileName = rs.getString("file_name"), // 可以进一步处理文件名
                            originalName = rs.getString("file_name"),
                            mimeType = rs.getString("mime_type"),
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
}