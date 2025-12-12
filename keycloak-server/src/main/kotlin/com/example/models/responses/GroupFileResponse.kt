package com.example.models.responses

import java.time.OffsetDateTime

data class GroupFileResponse(
    val id: Long,
    val fileId: Long,
    val groupId: Long,
    val fileName: String,
    val originalName: String,
    val mimeType: String,
    val category: String,
    val sizeBytes: Long,
    val ownerId: String,
    val sharedBy: String,
    val permission: String,
    val sharedAt: OffsetDateTime
)

data class GroupFilesResponse(
    val files: List<GroupFileResponse>,
    val total: Int
)