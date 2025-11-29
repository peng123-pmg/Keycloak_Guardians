package com.example.models.responses

data class UserResponse(
    val id: String,
    val username: String,
    val email: String,
    val enabled: Boolean,
    val roles: List<String>
)