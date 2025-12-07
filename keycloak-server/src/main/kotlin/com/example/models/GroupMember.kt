package com.example.models

import java.time.OffsetDateTime

data class GroupMember(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val role: String,
    val status: String,
    val joinedAt: OffsetDateTime,
    val leftAt: OffsetDateTime?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)