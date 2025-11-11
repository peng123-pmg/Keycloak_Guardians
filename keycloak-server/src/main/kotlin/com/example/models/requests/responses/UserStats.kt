package com.example.models.responses

data class UserStats(
    val totalUsers: Int,
    val activeUsers: Int,
    val newUsersToday: Int,
    val userRoles: Map<String, Int>,
    val registrationTrend: List<DailyRegistration>
)