package com.example.services

import jakarta.enterprise.context.ApplicationScoped
import java.sql.SQLIntegrityConstraintViolationException
import javax.sql.DataSource

@ApplicationScoped
class UserService(
    private val dataSource: DataSource
) {

    fun getOrCreateLocalUserId(keycloakUserId: String, username: String?, email: String?): Long {
        dataSource.connection.use { conn ->
            val querySql = """
                SELECT id FROM users WHERE keycloak_user_id = ?
            """.trimIndent()

            conn.prepareStatement(querySql).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        return rs.getLong("id")
                    }
                }
            }

            val insertSql = """
                INSERT INTO users (keycloak_user_id, realm, username, email, display_name, status)
                VALUES (?, 'guardians', ?, ?, ?, 'ACTIVE')
            """.trimIndent()

            return try {
                conn.prepareStatement(insertSql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                    ps.setString(1, keycloakUserId)
                    ps.setString(2, username ?: keycloakUserId)
                    ps.setString(3, email ?: "")
                    ps.setString(4, username ?: keycloakUserId)
                    ps.executeUpdate()

                    ps.generatedKeys.use { keys ->
                        if (keys.next()) {
                            return keys.getLong(1)
                        }
                    }
                }
                // 如果没有拿到主键，回退到再次查询
                getOrCreateLocalUserId(keycloakUserId, username, email)
            } catch (ex: SQLIntegrityConstraintViolationException) {
                // 可能是 uk_users_realm_username 或其他唯一约束冲突，尝试按用户名回查
                findUserIdByUsernameInternal(conn, username ?: keycloakUserId)
                    ?: throw ex
            }
        }
    }

    fun findUserIdByUsername(username: String): Long? {
        if (username.isBlank()) return null
        dataSource.connection.use { conn ->
            return findUserIdByUsernameInternal(conn, username)
        }
    }

    private fun findUserIdByUsernameInternal(conn: java.sql.Connection, username: String): Long? {
        val sql = """
            SELECT id FROM users WHERE realm = 'guardians' AND username = ?
        """.trimIndent()
        conn.prepareStatement(sql).use { ps ->
            ps.setString(1, username)
            ps.executeQuery().use { rs ->
                return if (rs.next()) rs.getLong("id") else null
            }
        }
    }

    fun getLocalUserId(keycloakUserId: String): Long? {
        dataSource.connection.use { conn ->
            val sql = """
                SELECT id FROM users WHERE keycloak_user_id = ?
            """.trimIndent()

            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.executeQuery().use { rs ->
                    return if (rs.next()) {
                        rs.getLong("id")
                    } else {
                        null
                    }
                }
            }
        }
    }
}