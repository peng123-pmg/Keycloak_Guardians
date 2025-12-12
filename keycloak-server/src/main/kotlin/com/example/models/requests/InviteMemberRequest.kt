package com.example.models.requests

data class InviteMemberRequest(
    val userId: Long? = null,
    val username: String? = null,
    val role: String? = null
)

