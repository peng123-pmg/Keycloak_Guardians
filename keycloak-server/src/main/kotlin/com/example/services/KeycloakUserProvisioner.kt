package com.example.services

import com.example.config.KeycloakConfig
import com.example.models.requests.UserSyncSnapshot
import jakarta.annotation.PostConstruct
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.jboss.logging.Logger

@ApplicationScoped
class KeycloakUserProvisioner(
    private val keycloakConfig: KeycloakConfig,
    private val userRepository: UserRepository
) {
    private val logger: Logger = Logger.getLogger(KeycloakUserProvisioner::class.java)

    @ConfigProperty(name = "user.sync.bootstrap-enabled", defaultValue = "true")
    lateinit var bootstrapEnabled: String

    fun syncUserById(keycloakUserId: String) {
        runCatching {
            keycloakConfig.getKeycloakInstance().use { kc ->
                val user = kc.realm(keycloakConfig.realm).users().get(keycloakUserId).toRepresentation()
                upsertUser(user, source = "admin-create")
            }
        }.onFailure {
            logger.warn("Failed to synchronize user $keycloakUserId after creation: ${it.message}")
        }
    }

    fun syncAllUsers() {
        if (bootstrapEnabled.equals("false", ignoreCase = true)) {
            logger.debug("Bootstrap user sync disabled via configuration")
            return
        }
        runCatching {
            keycloakConfig.getKeycloakInstance().use { kc ->
                val realm = kc.realm(keycloakConfig.realm)
                var first = 0
                val pageSize = 50
                while (true) {
                    val users = realm.users().search("", first, pageSize)
                    if (users.isEmpty()) break
                    users.forEach { upsertUser(it, source = "bootstrap") }
                    first += users.size
                }
            }
        }.onFailure {
            logger.warn("Failed to bootstrap users from Keycloak: ${it.message}")
        }
    }

    private fun upsertUser(representation: org.keycloak.representations.idm.UserRepresentation, source: String) {
        val snapshot = UserSyncSnapshot(
            keycloakUserId = representation.id,
            realm = keycloakConfig.realm,
            username = representation.username,
            email = representation.email,
            displayName = buildDisplayName(representation),
            source = source
        )
        userRepository.upsert(
            keycloakUserId = snapshot.keycloakUserId,
            realm = snapshot.realm,
            username = snapshot.username,
            email = snapshot.email,
            displayName = snapshot.displayName,
            source = snapshot.source
        )
    }

    private fun buildDisplayName(user: org.keycloak.representations.idm.UserRepresentation): String? {
        val fullName = listOfNotNull(user.firstName, user.lastName)
            .joinToString(" ")
            .trim()
        return fullName.ifBlank { user.username }
    }
}

