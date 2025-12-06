plugins {
    id("io.quarkus") version "3.15.1"
    kotlin("jvm") version "2.0.21"
}

repositories {
    mavenCentral()
    mavenLocal()
    maven {
        url = uri("https://repo.mysql.com/")
    }
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
    implementation("io.quarkus:quarkus-resteasy-qute")
    implementation("io.quarkus:quarkus-resteasy-client")
    implementation("io.quarkus:quarkus-resteasy-client-jackson")
    implementation("io.quarkus:quarkus-resteasy-multipart")

    // 注意：不添加任何multipart依赖

    testImplementation("io.quarkus:quarkus-junit5")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkus:quarkus-test-security-jwt")
    implementation("io.quarkus:quarkus-smallrye-openapi")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-flyway")

    // Keycloak Admin Client
    implementation("org.keycloak:keycloak-admin-client:26.4.1")
    implementation("org.jboss.resteasy:resteasy-multipart-provider:6.2.9.Final")

    // Jackson
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-core:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-annotations:2.15.2")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.15.2")

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
