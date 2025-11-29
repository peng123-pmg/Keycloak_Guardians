package com.example.utils

import org.eclipse.microprofile.jwt.JsonWebToken

object RoleUtils {

    fun getRolesFromToken(jwt: JsonWebToken): List<String> {
        return try {
            val realmAccess = jwt.getClaim<Map<String, Any>>("realm_access")
            val rolesRaw = realmAccess?.get("roles")

            when (rolesRaw) {
                is List<*> -> rolesRaw.map {
                    it.toString().trim().removeSurrounding("\"").removeSurrounding("'")
                }
                else -> emptyList()
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun hasRole(jwt: JsonWebToken, role: String): Boolean {
        return getRolesFromToken(jwt).contains(role.trim())
    }

    // 检查管理员权限 - 只有admin角色有管理权限
    fun hasAdminRole(jwt: JsonWebToken): Boolean {
        return hasRole(jwt, "admin")
    }

    // 检查用户权限 - 所有认证用户都有user权限
    fun hasUserRole(jwt: JsonWebToken): Boolean {
        val roles = getRolesFromToken(jwt)
        return roles.contains("admin") || roles.contains("user")
    }
}