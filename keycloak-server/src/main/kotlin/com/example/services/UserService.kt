package com.example.services

import jakarta.enterprise.context.ApplicationScoped
import java.sql.Connection
import javax.sql.DataSource

@ApplicationScoped
class UserService(
    private val dataSource: DataSource
) {

    fun getOrCreateLocalUserId(keycloakUserId: String, username: String?, email: String?): Long {
        dataSource.connection.use { conn ->
            // 1. 先查询是否存在
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

            // 2. 不存在则创建
            val insertSql = """
                INSERT INTO users (keycloak_user_id, realm, username, email, display_name, status)
                VALUES (?, 'guardians', ?, ?, ?, 'ACTIVE')
            """.trimIndent()

            conn.prepareStatement(insertSql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.setString(2, username ?: keycloakUserId)
                ps.setString(3, email ?: "")
                ps.setString(4, username ?: keycloakUserId)
                ps.executeUpdate()

                ps.generatedKeys.use { keys ->
                    if (keys.next()) {
                        return keys.getLong(1)
                    } else {
                        // 如果获取失败，尝试再次查询
                        return getOrCreateLocalUserId(keycloakUserId, username, email)
                    }
                }
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