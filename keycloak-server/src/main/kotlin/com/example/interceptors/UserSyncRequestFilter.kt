package com.example.interceptors

import com.example.services.UserSyncService
import jakarta.annotation.Priority
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.inject.Provider
import jakarta.ws.rs.Priorities
import jakarta.ws.rs.container.ContainerRequestContext
import jakarta.ws.rs.container.ContainerRequestFilter
import jakarta.ws.rs.ext.Provider as JaxrsProvider
import org.eclipse.microprofile.jwt.JsonWebToken

@JaxrsProvider
@Priority(Priorities.AUTHORIZATION)
@ApplicationScoped
class UserSyncRequestFilter @Inject constructor(
    private val jwtProvider: Provider<JsonWebToken>,
    private val userSyncService: UserSyncService
) : ContainerRequestFilter {

    override fun filter(requestContext: ContainerRequestContext) {
        val jwt = runCatching { jwtProvider.get() }.getOrNull()
        runCatching {
            userSyncService.syncCurrentUser(jwt)
        }
    }
}
