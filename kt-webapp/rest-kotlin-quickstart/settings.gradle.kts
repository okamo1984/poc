pluginManagement {
    val quarkusPluginVersion: String by settings
    val quarkusPluginId: String by settings
    val komapperVersion: String by settings
    val kspVersion: String by settings
    repositories {
        mavenCentral()
        gradlePluginPortal()
        mavenLocal()
    }
    plugins {
        id(quarkusPluginId) version quarkusPluginVersion
        id("org.komapper.gradle") version komapperVersion
        id("com.google.devtools.ksp") version kspVersion
    }
}
rootProject.name="rest-kotlin-quickstart"
