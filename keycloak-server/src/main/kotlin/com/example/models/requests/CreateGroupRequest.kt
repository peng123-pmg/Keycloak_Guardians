package com.example.models.requests

data class CreateGroupRequest(
    val name: String,
    val description: String? = null,
    val courseCode: String? = null,
    val joinPolicy: String = "INVITE_ONLY",
    val memberLimit: Int = 50
)