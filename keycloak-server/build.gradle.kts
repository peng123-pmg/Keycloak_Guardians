plugins {
    id("io.quarkus") version "3.15.1"
    kotlin("jvm") version "2.0.21"
}

repositories {
    mavenCentral()
    mavenLocal()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(enforcedPlatform("io.quarkus:quarkus-bom:3.15.1"))
    implementation("io.quarkus:quarkus-resteasy")
    implementation("io.quarkus:quarkus-oidc")
    implementation("io.quarkus:quarkus-kotlin")
    implementation("io.quarkus:quarkus-smallrye-jwt")
    implementation("io.quarkus:quarkus-resteasy-jackson")
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-flyway")

    testImplementation("io.quarkus:quarkus-junit5")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkus:quarkus-test-security-jwt")
    implementation("io.quarkus:quarkus-smallrye-openapi")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Keycloak Admin Client - 使用正确的版本和依赖
    implementation("org.keycloak:keycloak-admin-client:22.0.5")

    // 添加必要的 RESTEasy 依赖以支持 Keycloak Admin Client
    implementation("org.jboss.resteasy:resteasy-client:6.2.8.Final")
    implementation("org.jboss.resteasy:resteasy-jaxb-provider:6.2.8.Final")
    implementation("org.jboss.resteasy:resteasy-multipart-provider:6.2.8.Final")

    // 添加 JAXB 依赖（Keycloak Admin Client 需要）
    implementation("javax.xml.bind:jaxb-api:2.3.1")
    implementation("com.sun.xml.bind:jaxb-impl:4.0.4")
    implementation("com.sun.xml.bind:jaxb-core:4.0.4")

    // 添加必要的 XML 处理依赖
    implementation("org.glassfish.jaxb:jaxb-runtime:4.0.4")

    // MySQL
    implementation("io.quarkus:quarkus-jdbc-mysql")
    implementation("io.quarkus:quarkus-agroal")
    implementation("com.mysql:mysql-connector-j:8.3.0")
    implementation(kotlin("stdlib-jdk8"))
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "17"
    targetCompatibility = "17"
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}