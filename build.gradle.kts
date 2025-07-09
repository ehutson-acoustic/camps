plugins {
    java
    id("org.springframework.boot") version "3.5.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.netflix.dgs.codegen") version "7.0.3"
    id("org.liquibase.gradle") version "2.2.0" // Add Liquibase Gradle plugin
}

group = "com.acoustic"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(24)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

extra["netflixDgsVersion"] = "10.2.1"

val mapstructVersion = "1.5.5.Final"

dependencies {
    // --- Spring Boot Starters ---
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")         // JPA support
    implementation("org.springframework.boot:spring-boot-starter-validation")       // Bean validation
    implementation("org.springframework.boot:spring-boot-starter-web")              // Web support

    // --- Netflix DGS (GraphQL) ---
    implementation("com.netflix.graphql.dgs:graphql-dgs-spring-graphql-starter")    // DGS GraphQL starter
    implementation("com.netflix.graphql.dgs:graphql-dgs-extended-scalars")          // DGS extended scalars

    // --- MapStruct (Mapping) ---
    implementation("org.mapstruct:mapstruct:${mapstructVersion}")

    // --- Database & Migration ---
    implementation("org.liquibase:liquibase-core")                                  // Liquibase core
    runtimeOnly("org.postgresql:postgresql")                                        // PostgreSQL JDBC driver

    // --- Lombok (Boilerplate reduction) ---
    compileOnly("org.projectlombok:lombok")                                        // Lombok (compile only)
    annotationProcessor("org.projectlombok:lombok")                                // Lombok annotation processor

    // --- Spring Boot Development Tools ---
    developmentOnly("org.springframework.boot:spring-boot-devtools")               // Devtools for hot reload
    developmentOnly("org.springframework.boot:spring-boot-docker-compose")         // Docker Compose support

    // --- Annotation Processors ---
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor") // Spring config processor
    annotationProcessor("org.mapstruct:mapstruct-processor:${mapstructVersion}")        // MapStruct processor

    // --- Testing ---
    testImplementation("org.springframework.boot:spring-boot-starter-test")        // Spring Boot test starter
    testImplementation("com.netflix.graphql.dgs:graphql-dgs-spring-graphql-starter-test") // DGS test starter
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")                  // JUnit platform launcher

    // --- Liquibase CLI Runtime ---
    liquibaseRuntime("org.liquibase:liquibase-core")                               // Liquibase CLI
    liquibaseRuntime("org.postgresql:postgresql")                                  // PostgreSQL for Liquibase
    liquibaseRuntime("info.picocli:picocli:4.6.3")                                // Picocli for CLI parsing
}

dependencyManagement {
    imports {
        mavenBom("com.netflix.graphql.dgs:graphql-dgs-platform-dependencies:${property("netflixDgsVersion")}")
    }
}

tasks.generateJava {
    packageName = "com.acoustic.camps.codegen"
    generateClient = false
}

tasks.withType<Test> {
    useJUnitPlatform()
}

liquibase {
    activities.register("main") {
        arguments = mapOf(
            "changeLogFile" to "db/changelog/db.changelog-master.yaml",
            "searchPath" to "src/main/resources/",
            "url" to "jdbc:postgresql://localhost:5432/camps",
            "username" to "camps",
            "password" to "camps"
        )
    }
    runList = "main"
}