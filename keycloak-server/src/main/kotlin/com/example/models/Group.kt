package com.example.models

import java.time.OffsetDateTime

data class Group(
    val id: Long,
    val realm: String,
    val name: String,
    val description: String?,
    val courseCode: String?,
    val joinPolicy: String,
    val memberLimit: Int,
    val status: String,
    val createdBy: Long?,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)