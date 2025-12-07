package com.example.models.requests

data class CreateUserRequest(
    val username: String = "",
    val email: String? = null,  // 修改为可空
    val firstName: String? = null,
    val lastName: String? = null,
    val enabled: Boolean = true,
    val roles: List<String> = emptyList()
)