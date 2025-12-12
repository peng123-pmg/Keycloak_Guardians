package com.example.services

import com.example.models.entities.UserRecord
import java.sql.Connection
import java.sql.ResultSet
import java.sql.SQLIntegrityConstraintViolationException
import java.sql.Statement
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
        dataSource.connection.use { conn ->
            val sql = """
                INSERT INTO users (
                    keycloak_user_id, realm, username, email, display_name,
                    status, last_login_at, last_sync_source, last_sync_at, sync_attempts
                )
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
                    updated_at = CURRENT_TIMESTAMP,
                    id = LAST_INSERT_ID(id)
            """.trimIndent()

            conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.setString(2, realm)
                ps.setString(3, username)
                ps.setString(4, email)
                ps.setString(5, displayName)
                ps.setString(6, source)

                ps.executeUpdate()

                val rowId = ps.generatedKeys.use { keys -> if (keys.next()) keys.getLong(1) else null }
                    ?: selectByKeycloakId(conn, keycloakUserId, lock = false)?.id
                    ?: throw IllegalStateException("Failed to resolve user id after upsert")

                return selectById(conn, rowId)
                    ?: throw IllegalStateException("Failed to read user after upsert")
            }
        }
    }

    private fun selectByKeycloakId(conn: Connection, keycloakUserId: String, lock: Boolean): UserRecord? {
        val sql = buildString {
            append(
                """
                SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                       total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
                  FROM users
                 WHERE keycloak_user_id = ?
                """.trimIndent()
            )
            if (lock) {
                append(" FOR UPDATE")
            }
        }
        conn.prepareStatement(sql).use { ps ->
            ps.setString(1, keycloakUserId)
            ps.executeQuery().use { rs ->
                return if (rs.next()) mapRecord(rs) else null
            }
        }
    }

    private fun insertUser(
        conn: Connection,
        keycloakUserId: String,
        realm: String,
        username: String,
        email: String?,
        displayName: String?,
        source: String
    ): UserRecord? {
        val sql = """
            INSERT INTO users (keycloak_user_id, realm, username, email, display_name, status, last_login_at, last_sync_source, last_sync_at, sync_attempts)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, 1)
        """.trimIndent()
        return try {
            conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS).use { ps ->
                ps.setString(1, keycloakUserId)
                ps.setString(2, realm)
                ps.setString(3, username)
                ps.setString(4, email)
                ps.setString(5, displayName)
                ps.setString(6, source)
                ps.executeUpdate()
                ps.generatedKeys.use { keys ->
                    if (keys.next()) {
                        return selectById(conn, keys.getLong(1))
                    }
                }
            }
            selectByKeycloakId(conn, keycloakUserId, lock = true)
        } catch (ex: SQLIntegrityConstraintViolationException) {
            if (ex.message?.contains("uk_users_realm_username", ignoreCase = true) == true) {
                return selectByRealmAndUsername(conn, realm, username)
            }
            throw ex
        }
    }

    private fun selectByRealmAndUsername(
        conn: Connection,
        realm: String,
        username: String
    ): UserRecord? {
        conn.prepareStatement(
            """
                SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                       total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
                  FROM users
                 WHERE realm = ? AND username = ?
            """.trimIndent()
        ).use { ps ->
            ps.setString(1, realm)
            ps.setString(2, username)
            ps.executeQuery().use { rs ->
                return if (rs.next()) mapRecord(rs) else null
            }
        }
    }

    private fun updateUser(
        conn: Connection,
        userId: Long,
        username: String,
        email: String?,
        displayName: String?,
        source: String
    ): UserRecord? {
        val sql = """
            UPDATE users SET
                username = ?,
                email = ?,
                display_name = ?,
                status = 'ACTIVE',
                last_login_at = CURRENT_TIMESTAMP,
                last_sync_source = ?,
                last_sync_at = CURRENT_TIMESTAMP,
                sync_attempts = sync_attempts + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """.trimIndent()
        conn.prepareStatement(sql).use { ps ->
            ps.setString(1, username)
            ps.setString(2, email)
            ps.setString(3, displayName)
            ps.setString(4, source)
            ps.setLong(5, userId)
            ps.executeUpdate()
        }
        return selectById(conn, userId)
    }

    private fun selectById(conn: Connection, id: Long): UserRecord? {
        conn.prepareStatement(
            """
            SELECT id, keycloak_user_id, realm, username, email, display_name, status,
                   total_storage_quota, last_login_at, last_sync_source, last_sync_at, sync_attempts
              FROM users
             WHERE id = ?
            """.trimIndent()
        ).use { ps ->
            ps.setLong(1, id)
            ps.executeQuery().use { rs ->
                return if (rs.next()) mapRecord(rs) else null
            }
        }
    }
}
