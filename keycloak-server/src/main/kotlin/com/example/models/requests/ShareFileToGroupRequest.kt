package com.example.models.requests

data class ShareFileToGroupRequest(
    val fileId: Long,
    val permission: String = "READ"
)