package com.example.models.responses

import java.time.OffsetDateTime

data class GroupMemberResponse(
    val id: Long,
    val userId: Long,
    val username: String?,
    val displayName: String?,
    val email: String?,
    val role: String,
    val joinedAt: OffsetDateTime
)

