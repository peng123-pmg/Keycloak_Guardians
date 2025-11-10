package com.example

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import jakarta.inject.Inject

@Path("/api/users/me")
class UserResource @Inject constructor(
    private val jwt: JsonWebToken
) {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun me(): Map<String, Any?> = mapOf(
        "username" to jwt.name,
        "email" to jwt.getClaim<String>("email"),
        "roles" to jwt.groups
    )
}