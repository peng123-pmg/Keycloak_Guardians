package com.example.services

import com.example.config.KeycloakConfig
import com.example.models.requests.UserSyncSnapshot
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.eclipse.microprofile.jwt.JsonWebToken
import org.jboss.logging.Logger

@ApplicationScoped
class UserSyncService(
    private val userRepository: UserRepository,
    private val keycloakConfig: KeycloakConfig
) {

    @ConfigProperty(name = "user.sync.enabled", defaultValue = "true")
    lateinit var syncEnabled: String

    private val logger: Logger = Logger.getLogger(UserSyncService::class.java)

    fun syncCurrentUser(jwt: JsonWebToken?) {
        if (syncEnabled.equals("false", ignoreCase = true) || jwt == null) {
            return
        }

        val snapshotFromToken = buildSnapshotFromToken(jwt)
        val snapshot = snapshotFromToken ?: fetchSnapshotFromKeycloak(jwt)

        if (snapshot == null) {
            logger.warn("User sync skipped: missing token claims and Keycloak lookup failed")
            return
        }

        runCatching {
            userRepository.upsert(
                keycloakUserId = snapshot.keycloakUserId,
                realm = snapshot.realm,
                username = snapshot.username,
                email = snapshot.email,
                displayName = snapshot.displayName,
                source = snapshot.source
            )
        }.onFailure { logger.error("Failed to sync user ${snapshot.keycloakUserId}", it) }
    }

    private fun buildSnapshotFromToken(jwt: JsonWebToken): UserSyncSnapshot? {
        val keycloakId = jwt.subject ?: return null
        val username = jwt.name ?: jwt.getClaim("preferred_username")
        val email = jwt.getClaim<String>("email")
        val displayName = jwt.getClaim<String>("name") ?: username
        val realm = jwt.getClaim<String>("iss")?.substringAfterLast("/realms/") ?: keycloakConfig.realm

        return username?.let {
            UserSyncSnapshot(
                keycloakUserId = keycloakId,
                realm = realm,
                username = it,
                email = email,
                displayName = displayName,
                source = "token"
            )
        }
    }

    private fun fetchSnapshotFromKeycloak(jwt: JsonWebToken): UserSyncSnapshot? {
        val keycloakId = jwt.subject ?: return null
        val realm = jwt.getClaim<String>("iss")?.substringAfterLast("/realms/") ?: keycloakConfig.realm

        return runCatching {
            keycloakConfig.getKeycloakInstance().use { kc ->
                val user = kc.realm(realm).users().get(keycloakId).toRepresentation()
                UserSyncSnapshot(
                    keycloakUserId = keycloakId,
                    realm = realm,
                    username = user.username,
                    email = user.email,
                    displayName = listOfNotNull(user.firstName, user.lastName).joinToString(" ").ifBlank { user.username },
                    source = "keycloak"
                )
            }
        }.onFailure { logger.warn("Keycloak admin lookup failed for $keycloakId: ${it.message}") }
            .getOrNull()
    }
}
