package com.example.models.entities

import java.time.OffsetDateTime

data class UserRecord(
    val id: Long,
    val keycloakUserId: String,
    val realm: String,
    val username: String,
    val email: String?,
    val displayName: String?,
    val status: String,
    val totalStorageQuota: Long?,
    val lastLoginAt: OffsetDateTime?,
    val lastSyncSource: String?,
    val lastSyncAt: OffsetDateTime?,
    val syncAttempts: Int
)
