plugins {
    id("io.quarkus") version "3.9.3"
    kotlin("jvm") version "1.9.22"
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
    implementation(enforcedPlatform("io.quarkus:quarkus-bom:3.9.3"))
    implementation("io.quarkus:quarkus-resteasy-reactive")
    implementation("io.quarkus:quarkus-oidc")
    implementation("io.quarkus:quarkus-kotlin")
    implementation("io.quarkus:quarkus-smallrye-jwt")
<<<<<<< Updated upstream
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("io.quarkus:quarkus-resteasy-reactive-qute")
=======
    implementation("io.quarkus:quarkus-resteasy-jackson")
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-flyway")

>>>>>>> Stashed changes
    testImplementation("io.quarkus:quarkus-junit5")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkus:quarkus-test-security-jwt")
    implementation("io.quarkus:quarkus-smallrye-openapi")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
<<<<<<< Updated upstream
    implementation("io.quarkus:quarkus-arc")

    // Keycloak Admin Client
    implementation("org.keycloak:keycloak-admin-client:26.4.1")
    implementation("org.jboss.resteasy:resteasy-client:6.2.8.Final")
    implementation("org.jboss.resteasy:resteasy-jackson2-provider:6.2.8.Final")
=======

    // Keycloak Admin Client
    implementation("org.keycloak:keycloak-admin-client:26.4.1")
>>>>>>> Stashed changes

    // Jackson
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-core:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-annotations:2.15.2")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.15.2")
<<<<<<< Updated upstream
=======

    // MySQL
    implementation("io.quarkus:quarkus-jdbc-mysql")
    implementation("io.quarkus:quarkus-agroal")
    implementation("com.mysql:mysql-connector-j:8.3.0")
    implementation(kotlin("stdlib-jdk8"))

    implementation("jakarta.ws.rs:jakarta.ws.rs-api:3.1.0")
>>>>>>> Stashed changes
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "17"
    targetCompatibility = "17"
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
<<<<<<< Updated upstream
    kotlinOptions.jvmTarget = "17"
=======
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
>>>>>>> Stashed changes
}