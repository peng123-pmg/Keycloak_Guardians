package com.example.config

import io.agroal.api.AgroalDataSource
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.inject.Produces
import javax.sql.DataSource

@ApplicationScoped
class DatabaseConfig(
    private val dataSource: AgroalDataSource
) {

    @Produces
    fun produceDataSource(): DataSource = dataSource
}

