package com.example.models.requests

data class UserSyncSnapshot(
    val keycloakUserId: String,
    val realm: String,
    val username: String,
    val email: String?,
    val displayName: String?,
    val source: String
)
