package com.example.models.responses

import java.time.OffsetDateTime

data class UserStats(
    val summary: UserStatsSummary,
    val filesByStatus: Map<String, Long>,
    val topUsersByStorage: List<UserStorageEntry>,
    val generatedAt: OffsetDateTime = OffsetDateTime.now()
)

data class UserStatsSummary(
    val totalOwners: Long,
    val activeOwners: Long,
    val totalFiles: Long,
    val storageUsedBytes: Long,
    val storageUsedReadable: String,
    val averageFileSizeBytes: Long
)

data class UserStorageEntry(
    val ownerId: String,
    val fileCount: Long,
    val storageBytes: Long
)
