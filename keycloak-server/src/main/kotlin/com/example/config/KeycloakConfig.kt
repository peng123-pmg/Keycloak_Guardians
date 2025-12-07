package com.example.config

import jakarta.annotation.PreDestroy
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.jboss.resteasy.client.jaxrs.ResteasyClient
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl
import org.jboss.resteasy.plugins.providers.FormUrlEncodedProvider

@ApplicationScoped
class KeycloakConfig {
    @ConfigProperty(name = "keycloak.server.url")
    lateinit var serverUrl: String

    @ConfigProperty(name = "keycloak.realm")
    lateinit var realm: String

    @ConfigProperty(name = "keycloak.admin.client.id")
    lateinit var adminClientId: String

    @ConfigProperty(name = "keycloak.admin.username")
    lateinit var adminUsername: String

    @ConfigProperty(name = "keycloak.admin.password")
    lateinit var adminPassword: String

    private fun buildClient(): ResteasyClient =
        ResteasyClientBuilderImpl()
            .register(FormUrlEncodedProvider())
            .build()

    fun getKeycloakInstance(): Keycloak {
        return KeycloakBuilder.builder()
            .serverUrl(serverUrl)
            .realm("master")
            .clientId(adminClientId)
            .username(adminUsername)
            .password(adminPassword)
            .resteasyClient(buildClient())
            .build()
    }
}