package com.example.models.responses

import java.time.OffsetDateTime

data class GroupResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val courseCode: String?,
    val joinPolicy: String,
    val memberLimit: Int,
    val status: String,
    val createdBy: Long?,
    val memberCount: Long = 0,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

data class GroupListResponse(
    val groups: List<GroupResponse>,
    val total: Int
)