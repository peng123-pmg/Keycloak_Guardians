package com.example.models.responses

import java.time.OffsetDateTime

data class FileResponse(
    val id: Long,
    val fileName: String,
    val originalName: String,
    val mimeType: String,
    val category: String,
    val sizeBytes: Long,
    val ownerId: String,
    val checksum: String?,
    val status: String,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

data class FileUploadResponse(
    val message: String,
    val file: FileResponse
)

data class FileListResponse(
    val files: List<FileResponse>,
    val total: Int,
    val totalSize: Long
)