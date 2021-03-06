plugins {
    application
}

dependencies {
    implementation(project(":core"))
    runtimeOnly("org.slf4j:slf4j-simple")

    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-jdk8")
}

application {
    mainClass.set("example.armeria.contextpropagation.kotlin.MainKt")
}
