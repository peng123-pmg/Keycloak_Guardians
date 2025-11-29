package com.example.config

import io.agroal.api.AgroalDataSource
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class DatabaseConfig(
    private val dataSource: AgroalDataSource
)
