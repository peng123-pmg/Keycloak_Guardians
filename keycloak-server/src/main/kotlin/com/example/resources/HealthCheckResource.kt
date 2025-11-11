package com.example.resources

import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import jakarta.enterprise.context.ApplicationScoped

@Path("/api/health")
@ApplicationScoped
class HealthCheckResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    fun healthCheck(): Response {
        return Response.ok(mapOf(
            "status" to "UP",
            "service" to "Quarkus User Management API",
            "timestamp" to System.currentTimeMillis()
        )).build()
    }
}