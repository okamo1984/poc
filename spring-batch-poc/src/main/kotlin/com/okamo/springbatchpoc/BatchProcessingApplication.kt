package com.okamo.springbatchpoc

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import kotlin.system.exitProcess

@SpringBootApplication
class BatchProcessingApplication

fun main(args: Array<String>) {
    exitProcess(SpringApplication.exit(SpringApplication.run(BatchProcessingApplication::class.java, *args)))
}
