package com.example.services

import com.example.models.entities.UserRecord
import java.sql.Connection
import java.sql.ResultSet
import java.time.OffsetDateTime
import javax.sql.DataSource
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class UserRepository(
    private val dataSource: DataSource
) {

    fun findByKeycloakId(keycloakUserId: String): UserRecord? = queryOne(
        """
            SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                   total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
              FROM users
             WHERE keycloak_user_id = ?
        """.trimIndent()
    ) { ps -> ps.setString(1, keycloakUserId) }

    fun findByRealmAndUsername(realm: String, username: String): UserRecord? = queryOne(
        """
            SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                   total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
              FROM users
             WHERE realm = ? AND username = ?
        """.trimIndent()
    ) { ps ->
        ps.setString(1, realm)
        ps.setString(2, username)
    }

    private fun queryOne(sql: String, binder: (java.sql.PreparedStatement) -> Unit): UserRecord? {
        dataSource.connection.use { conn ->
            conn.prepareStatement(sql).use { ps ->
                binder(ps)
                ps.executeQuery().use { rs ->
                    return if (rs.next()) mapRecord(rs) else null
                }
            }
        }
    }

    private fun mapRecord(rs: ResultSet): UserRecord = UserRecord(
        id = rs.getLong("id"),
        keycloakUserId = rs.getString("keycloak_user_id"),
        realm = rs.getString("realm"),
        username = rs.getString("username"),
        email = rs.getString("email"),
        displayName = rs.getString("display_name"),
        status = rs.getString("status"),
        totalStorageQuota = rs.getLong("total_storage_quota").takeIf { !rs.wasNull() },
        lastLoginAt = rs.getObject("last_login_at", OffsetDateTime::class.java),
        lastSyncSource = rs.getString("last_sync_source"),
        lastSyncAt = rs.getObject("last_sync_at", OffsetDateTime::class.java),
        syncAttempts = rs.getInt("sync_attempts")
    )

    fun upsert(
        keycloakUserId: String,
        realm: String,
        username: String,
        email: String?,
        displayName: String?,
        source: String
    ): UserRecord {
        val sql = """
            INSERT INTO users (keycloak_user_id, realm, username, email, display_name, status, last_login_at, last_sync_source, last_sync_at, sync_attempts)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, 1)
            ON DUPLICATE KEY UPDATE
                username = VALUES(username),
                email = VALUES(email),
                display_name = VALUES(display_name),
                status = 'ACTIVE',
                last_login_at = CURRENT_TIMESTAMP,
                last_sync_source = VALUES(last_sync_source),
                last_sync_at = CURRENT_TIMESTAMP,
                sync_attempts = sync_attempts + 1,
                updated_at = CURRENT_TIMESTAMP
        """.trimIndent()

        dataSource.connection.use { conn ->
            conn.autoCommit = true
            conn.prepareStatement(sql).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.setString(2, realm)
                ps.setString(3, username)
                ps.setString(4, email)
                ps.setString(5, displayName)
                ps.setString(6, source)
                ps.executeUpdate()
            }

            conn.prepareStatement(
                """
                    SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                           total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
                      FROM users
                     WHERE keycloak_user_id = ?
                """.trimIndent()
            ).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.executeQuery().use { rs ->
                    if (rs.next()) {
                        return mapRecord(rs)
                    }
                }
            }
        }

        throw IllegalStateException("Failed to read user after upsert")
    }
}
