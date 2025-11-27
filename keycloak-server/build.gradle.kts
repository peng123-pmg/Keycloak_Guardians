plugins {
    id("io.quarkus") version "3.15.1"
    kotlin("jvm") version "2.0.21"
}

repositories {
    mavenCentral()
    mavenLocal()
    maven("https://repo.mysql.com/mysql")
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
    implementation("io.quarkus:quarkus-resteasy-reactive")
    implementation("io.quarkus:quarkus-oidc")
    implementation("io.quarkus:quarkus-kotlin")
    implementation("io.quarkus:quarkus-smallrye-jwt")
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("io.quarkus:quarkus-resteasy-reactive-qute")
    testImplementation("io.quarkus:quarkus-junit5")
    testImplementation("io.rest-assured:rest-assured")
    testImplementation("io.quarkus:quarkus-test-security-jwt")
    implementation("io.quarkus:quarkus-smallrye-openapi")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.quarkus:quarkus-arc")
    implementation("io.quarkus:quarkus-flyway")

    // Keycloak Admin Client
    implementation("org.keycloak:keycloak-admin-client:26.4.1")
    implementation("org.jboss.resteasy:resteasy-client:6.2.8.Final")
    implementation("org.jboss.resteasy:resteasy-jackson2-provider:6.2.8.Final")

    // 确保 Jackson 版本兼容
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-core:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-annotations:2.15.2")

    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.15.2")

    // MySQL dependencies
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
    kotlinOptions.jvmTarget = "17"
}

val mysqlUrl = (System.getenv("MYSQL_JDBC_URL") ?: project.findProperty("mysqlUrl") as String?)
    ?: "jdbc:mysql://localhost:3306/iamkc?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true"
val mysqlUser = (System.getenv("MYSQL_USERNAME") ?: project.findProperty("mysqlUser") as String?) ?: "iamkc"
val mysqlPassword = (System.getenv("MYSQL_PASSWORD") ?: project.findProperty("mysqlPassword") as String?) ?: "iamkc"

configurations.all {
    resolutionStrategy.eachDependency {
        if (requested.group == "mysql" && requested.name == "mysql-connector-java") {
            useTarget("com.mysql:mysql-connector-j:${requested.version}")
        }
    }
}
